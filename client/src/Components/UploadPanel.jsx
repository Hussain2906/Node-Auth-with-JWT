import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadFiles,
  selectFilesStatus,
  selectFilesError,
} from "../Features/files/filesSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function UploadPanel() {
  const dispatch = useDispatch();
  const status = useSelector(selectFilesStatus);
  const error = useSelector(selectFilesError);
  const [selected, setSelected] = React.useState([]);

  function handleChange(e) {
    setSelected(Array.from(e.target.files || []));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("filesInput");
    if (!input || !input.files || input.files.length === 0) return;
    await dispatch(uploadFiles({ fileList: input.files }));
    setSelected([]); // clear after upload
  }

  return (
    <Card className="mx-auto mt-6 max-w-2xl shadow">
      <CardHeader className="flex flex-col items-center gap-2">
        <Upload className="h-6 w-6 text-blue-600" aria-hidden />
        <h3 className="text-lg font-semibold">Upload your files</h3>
        <p className="text-sm text-muted-foreground">
          Supported: mp4, mov, jpg, png, pdf, doc, docx
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filesInput">Choose files</Label>
            <Input
              type="file"
              id="filesInput"
              name="filesInput"
              multiple
              onChange={handleChange}
              accept=".mp4,.mov,.jpg,.jpeg,.png,.pdf,.doc,.docx"
              className="cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="submit"
              className="w-32"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Uploading..." : "Upload"}
            </Button>

            <div className="text-sm text-muted-foreground">
              Max size: {import.meta.env.VITE_MAX_MB || "200"} MB
              {selected.length > 0 && (
                <span className="ml-2 text-blue-600">
                  {selected.length} file{selected.length > 1 ? "s" : ""} selected
                </span>
              )}
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
        </form>
      </CardContent>
    </Card>
  );
}
