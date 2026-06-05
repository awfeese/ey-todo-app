import { WritableSignal } from "@angular/core";
import { form, maxLength, required } from "@angular/forms/signals";
import { lastValueFrom, Observable } from "rxjs";
import { ApiResponse } from "../../../shared/services";
import { TaskRequest } from "../models";

export const taskForm = (
    taskModel: WritableSignal<TaskRequest>,
    onSubmit: (request: TaskRequest) => Observable<ApiResponse>
) => {
    return form(
        taskModel, 
        root => {
            required(root.task);
            maxLength(root.task, 50);
        },
        {
            submission: {
                action: async (fieldTree) => {
                    const request = fieldTree().value();
                    const response = await lastValueFrom(onSubmit(request));

                    if (response.error) {
                        return [{
                            kind: 'server',
                            message: response.error.message,
                            fieldTree: fieldTree.task
                        }];
                    }

                    return;
                }
            }
        }
    );
};
