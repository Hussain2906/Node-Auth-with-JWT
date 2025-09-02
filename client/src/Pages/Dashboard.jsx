import React from "react";
import UploadPanel from "../Components/UploadPanel";
import FileGrid from "../Components/FileGrid";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/Features/auth/AuthSlice";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
    const dispatch = useDispatch();
  return (
    <div style={{ maxWidth: 960, margin: "20px auto", padding: "0 12px" }}>
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
          QR Code Generator
        </h2>
        <p className="mt-2 text-muted-foreground">
          Generate QR Codes for Files you Upload.
        </p>
      </div>
      <Button variant="outline" onClick={() => dispatch(logoutUser())}>
        Logout
      </Button>
    </div>
    <UploadPanel />
    <FileGrid />
  </div>
  
  );
}
