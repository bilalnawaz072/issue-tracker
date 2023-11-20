'use client';

import ErrorMessage from '@/app/components/ErrorMessage';
import Spinner from '@/app/components/Spinner';
import { issueSchema } from '@/app/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Issue } from '@prisma/client';
import { Button, Callout, Select, TextField } from "@radix-ui/themes";
import axios from "axios";
import "easymde/dist/easymde.min.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import SimpleMDE from "react-simplemde-editor";
import { z } from "zod";

type IssueFormData = z.infer<typeof issueSchema>;

const IssueForm = ({ issue }: { issue?: Issue }) => {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
  });
  const [error, setError] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSubmitting(true);
      if (issue) await axios.patch("/api/issues/" + issue.id, data);
      else await axios.post("/api/issues", data);
      router.push("/issues/list");
      router.refresh();
    } catch (error) {
      setSubmitting(false);
      setError("An unexpected error occurred.");
    }
  });

  return (
    <div className="max-w-xl">
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <form className="space-y-3" onSubmit={onSubmit}>
        <TextField.Root>
          <TextField.Input
            defaultValue={issue?.title}
            placeholder="Title"
            {...register("title")}
          />
        </TextField.Root>
        <ErrorMessage>{errors.title?.message}</ErrorMessage>

        <Controller
          control={control}
          name="priority"
          defaultValue={issue?.priority}
          rules={{ required: true }} // add required rule
          render={({ field }) => (
            <div>
              <label>
                <span className="font-bold mr-5">Priority: </span>
              </label>
              <select
                {...field}
                className="text-purple-500 bg-white border border-purple-500 rounded shadow mb-2 p-1 outline-none"
              >
                <option value="" className="text-gray-400">
                  {" "}
                  Select Priority
                </option>
                <option value="HIGH" className="text-red-600">
                  High
                </option>
                <option value="MEDIUM" className="text-yellow-600">
                  Medium
                </option>
                <option value="LOW" className="text-green-600">
                  Low
                </option>
                <option value="CRITICAL" className="text-red-900">
                  Critical
                </option>
                <option value="URGENT" className="text-orange-600">
                  Urgent
                </option>
                <option value="NOT_STARTED" className="text-blue-600">
                  Not Started
                </option>
                <option value="DEFERRED" className="text-purple-600">
                  Deferred
                </option>
                <option value="BACKLOG" className="text-gray-600">
                  Backlog
                </option>
              </select>
              {errors.priority && (
                <span className="text-red-500 italic">
                  {errors.priority.message}
                </span>
              )}{" "}
              {/* display error message */}
            </div>
          )}
        />
        <ErrorMessage>{errors.priority?.message}</ErrorMessage>

        <TextField.Root>
          <TextField.Input
            defaultValue={issue?.tags}
            placeholder="Tags"
            {...register("tags")}
          />
        </TextField.Root>
        <ErrorMessage>{errors.tags?.message}</ErrorMessage>

        <Controller
          name="description"
          control={control}
          defaultValue={issue?.description}
          render={({ field }) => (
            <SimpleMDE placeholder="Description" {...field} />
          )}
        />
        <ErrorMessage>{errors.description?.message}</ErrorMessage>
        <Button disabled={isSubmitting}>
          {issue ? "Update Issue" : "Submit New Issue"}{" "}
          {isSubmitting && <Spinner />}
        </Button>
      </form>
    </div>
  );
};

export default IssueForm;
