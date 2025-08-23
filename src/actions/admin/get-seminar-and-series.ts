"use server";

import prisma from "@/lib/prisma";

/**
 * Fetch seminars and series with nested relations for Admin UI.
 */
export const getSeminarsAndSeries = async () => {
	try {
		const [seminars, series] = await prisma.$transaction([
			prisma.seminar.findMany({
				orderBy: { order: "asc" },
				include: {
					audioFiles: true,
					lessons: {
						orderBy: { order: "asc" },
						include: {
							fragments: {
								orderBy: { order: "asc" },
								include: {
									slides: { orderBy: { order: "asc" } },
									videos: { orderBy: { order: "asc" } },
									narrationAudio: true,
								},
							},
						},
					},
				},
			}),
			prisma.series.findMany({
				orderBy: { order: "asc" },
				include: {
					audioFiles: true,
					lessons: {
						orderBy: { order: "asc" },
						include: {
							fragments: {
								orderBy: { order: "asc" },
								include: {
									slides: { orderBy: { order: "asc" } },
									videos: { orderBy: { order: "asc" } },
									narrationAudio: true,
								},
							},
						},
					},
				},
			}),
		]);

		return { ok: true as const, seminars, series };
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("getSeminarsAndSeries error:", message);
		return { ok: false as const, message: message, status: 500 };
	}
};