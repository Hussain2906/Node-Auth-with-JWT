import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    deleteFile,
  fetchFiles,
  selectFiles,
  selectFilesStatus,
} from "../Features/files/filesSlice";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Download, ExternalLink, File,Trash2 } from "lucide-react";

export default function FileGrid() {
  const dispatch = useDispatch();
  const items = useSelector(selectFiles);
  const status = useSelector(selectFilesStatus);

  React.useEffect(() => {
    dispatch(fetchFiles({ page: 1, limit: 20 }));
  }, [dispatch]);

  if (status === "loading" && items.length === 0) {
    return <div className="text-center mt-6">Loading list...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center mt-6 text-muted-foreground">
        No files uploaded yet.
      </div>
    );
  }

  return (
    <section className="bg-zinc-50 py-8 md:py-12 dark:bg-transparent">
      <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
        {items.map((file) => {
          console.log("file object:", file);
          return (
            <Card
              key={file.id}
              className="group shadow hover:shadow-lg transition"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <File className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-sm truncate max-w-[80px] sm:max-w-[100px] md:max-w-[130px]">
                    {file.originalName}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">{file.mimeType}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded border overflow-hidden">
                  <img
                    src={file.qrPngUrl}
                    alt="QR"
                    className="w-full object-contain bg-white p-2"
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <a
                    href={file.qrPngUrl}
                    download
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Download className="h-4 w-4" /> QR
                  </a>
                  <a
                    href={file.viewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-green-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Open
                  </a>
                  <button
                    onClick={() => dispatch(deleteFile(file.id))}
                    className="flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
