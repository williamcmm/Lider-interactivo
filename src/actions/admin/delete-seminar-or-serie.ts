"use server";

import prisma from "@/lib/prisma";

export const deleteSeminarOrSerie = async (id: string) => {
	try {
		const result = await prisma.$transaction(async (tx) => {
			const seminar = await tx.seminar.findUnique({ where: { id } });
			if (seminar) {
				await tx.seminar.delete({ where: { id } });
				return { ok: true as const, type: "seminar" as const, id };
			}

			const series = await tx.series.findUnique({ where: { id } });
			if (series) {
				await tx.series.delete({ where: { id } });
				return { ok: true as const, type: "series" as const, id };
			}

			return { ok: false as const, error: "No encontrado" };
		});

		return result;
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("deleteSeminarOrSerie error:", message);
		return { ok: false as const, error: message };
	}
};