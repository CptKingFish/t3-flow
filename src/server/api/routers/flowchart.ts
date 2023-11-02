import { type JsonObject } from "@prisma/client/runtime/library";
import { type ReactFlowJsonObject } from "reactflow";
import { z } from "zod";

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

  //create a flowchart snapshot based on the prisma schema
  createSnapshot: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const flowchart = await ctx.db.flowchart.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          state: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!flowchart) {
        throw new Error("Flowchart not found");
      }
      const snapshot = await ctx.db.flowchartSnapshots.create({
        data: {
          flowchartId: flowchart.id,
          state: flowchart.state  as unknown as JsonObject,
        },
      });
      return snapshot;
    }),
    getSnapshots: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const snapshots = await ctx.db.flowchartSnapshots.findMany({
        where: { flowchartId: id },
        select: {
          id: true,
          flowchartId: true,
          state: true,
          createdAt: true,
        },
      });
      return snapshots;
    }),
});
