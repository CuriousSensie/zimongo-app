import { LeadFile } from "@/types/lead";

export class FileCleanupManager {
  private uploadedFiles: LeadFile[] = [];

  // Track uploaded files
  addFiles(files: LeadFile[]) {
    this.uploadedFiles.push(...files);
  }

  // Remove files from tracking (when successfully saved)
  removeFiles(files: LeadFile[]) {
    const pathsToRemove = files.map(f => f.path);
    this.uploadedFiles = this.uploadedFiles.filter(
      file => !pathsToRemove.includes(file.path)
    );
  }

  // Get all tracked files
  getTrackedFiles(): LeadFile[] {
    return [...this.uploadedFiles];
  }

  // Cleanup all tracked files (for when user cancels)
  async cleanupAll(): Promise<void> {
    if (this.uploadedFiles.length === 0) return;

    try {
      const filePaths = this.uploadedFiles.map(file => file.path);
      const response = await fetch('/api/file/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePaths }),
      });

      if (response.ok) {
        console.log(`Cleanup completed: ${filePaths.length} files deleted`);
        this.uploadedFiles = []; // Clear tracking
      } else {
        console.error('Failed to cleanup some files');
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Cleanup specific files
  async cleanupFiles(files: LeadFile[]): Promise<void> {
    if (files.length === 0) return;

    try {
      const filePaths = files.map(file => file.path);
      const response = await fetch('/api/file/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePaths }),
      });

      if (response.ok) {
        console.log(`Cleanup completed: ${filePaths.length} files deleted`);
        // Remove from tracking
        this.removeFiles(files);
      } else {
        console.error('Failed to cleanup some files');
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Clear tracking without cleanup (for successful saves)
  clearTracking(): void {
    this.uploadedFiles = [];
  }
}

// Utility function for single file cleanup
export async function cleanupSingleFile(filePath: string): Promise<boolean> {
  try {
    const response = await fetch('/api/file/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filePaths: [filePath] }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error cleaning up file:', error);
    return false;
  }
}