import { type JsonObject } from "@prisma/client/runtime/library";
import { type ReactFlowJsonObject } from "reactflow";
import { z } from "zod";
import uploadToS3 from "~/@/utils/uploadToS3";
import deleteFromS3 from "~/@/utils/deleteFromS3";
import { createTRPCRouter, publicProcedure } from "~/@/server/api/trpc";

export const flowchartRouter = createTRPCRouter({
  getCharts: publicProcedure.query(({ ctx }) => {
    return ctx.db.flowchart.findMany({
      select: {
        id: true,
        title: true,
        state: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),
  createChart: publicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { title } = input;
      return ctx.db.flowchart.create({
        data: {
          title: title,
        },
      });
    }),
  getChart: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const { id } = input;
      return ctx.db.flowchart.findFirst({
        where: { id },
        select: {
          id: true,
          title: true,
          state: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }),
  updateChart: publicProcedure
    .input(z.object({ id: z.string(), state: z.custom<ReactFlowJsonObject>() }))
    .mutation(({ ctx, input }) => {
      const { id, state } = input;
      return ctx.db.flowchart.update({
        where: { id },
        data: {
          state: state as unknown as JsonObject,
        },
      });
    }),
  deleteChart: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      const { id } = input;
      return ctx.db.flowchart.delete({
        where: { id },
      });
    }),

  //create a flowchart snapshot based on the prisma schema, taking in the flowchart id and an image of the flowchart, uploading to s3
  createSnapshot: publicProcedure
    .input(z.object({ id: z.string(), image: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, image } = input;
      const flowchart = await ctx.db.flowchart.findFirst({
        where: { id },
      });
      if (!flowchart) {
        throw new Error("Flowchart not found");
      }
      const { title, state } = flowchart;
      const { Location: imageUrl } = await uploadToS3(
        process.env.AWS_BUCKET_NAME || "",
        `${id}-${Date.now()}.png`,
        Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64"),
        "image/png"
      );
      return ctx.db.flowchartSnapshots.create({
        data: {
          flowchartId: id,
          state: state as unknown as JsonObject,
          imageUrl: imageUrl,
        },
      });
    }),

  //delete snapshot and image from s3 bucket
  deleteSnapshot: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const snapshot = await ctx.db.flowchartSnapshots.findFirst({
        where: { id },
      });
      if (!snapshot) {
        throw new Error("Snapshot not found");
      }
      const { imageUrl } = snapshot;
      if (imageUrl) {
        const key = imageUrl.split('/').pop();
        await deleteFromS3(process.env.AWS_BUCKET_NAME || "", key || "");

      }

      return ctx.db.flowchartSnapshots.delete({
        where: { id },
      });
    }),


  getSnapshots: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const snapshots = await ctx.db.flowchartSnapshots.findMany({
        where: { flowchartId: id },
        select: {
          id: true,
          imageUrl: true,
          flowchartId: true,
          state: true,
          createdAt: true,
        },
      });
      return snapshots;
    }),

  restoreSnapshot: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const snapshot = await ctx.db.flowchartSnapshots.findFirst({
        where: { id },
      });
      if (!snapshot) {
        throw new Error("Snapshot not found");
      }
      const { flowchartId, state } = snapshot;
      await ctx.db.flowchart.update({
        where: { id: flowchartId },
        data: {
          state: state as unknown as JsonObject,
        },
      });
      return snapshot;
    }),
});
