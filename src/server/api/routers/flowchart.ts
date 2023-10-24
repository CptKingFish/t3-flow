import { type JsonObject } from "@prisma/client/runtime/library";
import { type ReactFlowJsonObject } from "reactflow";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/@/server/api/trpc";

const ReactFlowJson = z.custom<ReactFlowJsonObject>();

export const flowchartRouter = createTRPCRouter({
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
    .input(z.object({ id: z.string(), state: ReactFlowJson }))
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
});
