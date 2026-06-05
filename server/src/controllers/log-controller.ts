import { Request, Response } from "express";
import logger from "../config/logger";
import { success } from "../utils/response";

const asString = (value: unknown): string | undefined =>
    typeof value === 'string' ? value : undefined;

const logController = {
    create: (req: Request, res: Response) => {
        const { message, stack, source } = (req.body ?? {}) as Record<string, unknown>;

        logger.error(
            {
                clientError: {
                    message: asString(message) ?? 'Unknown client error',
                    stack: asString(stack),
                    source: asString(source),
                },
            },
            'Client error reported',
        );

        return success(res);
    },
};

export default logController;
