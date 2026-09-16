import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";

export const ConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  showReason = false,
  reasonRequired = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Provide a reason (optional)...",
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (reasonRequired && !reason.trim()) return;
    if (onConfirm) {
      onConfirm(showReason ? reason.trim() : undefined);
    }
  };

  const isConfirmDisabled = isLoading || (showReason && reasonRequired && !reason.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {variant === "destructive" && (
              <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        {showReason && (
          <div className="space-y-1.5 my-3">
            <Label htmlFor="confirm-dialog-reason" className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {reasonLabel} {reasonRequired && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="confirm-dialog-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              disabled={isLoading}
              className="text-sm"
              autoFocus
            />
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange?.(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={variant === "default" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
