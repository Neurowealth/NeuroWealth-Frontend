"use client";

import { useState } from "react";
import Avatar from "@/components/avatar/Avatar";
import AvatarUploader from "@/components/avatar/AvatarUploader";
import FileUpload from "@/components/avatar/FileUpload";
import ImageCrop from "@/components/avatar/ImageCrop";
import { logger } from "@/lib/logger";

export default function AvatarDemo() {
  const [activeTab, setActiveTab] = useState<
    "components" | "uploader" | "a11y"
  >("components");
  const [savedAvatar, setSavedAvatar] = useState<string | undefined>();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Avatar, Upload & Crop</h1>
          <p className="text-gray-400">
            Avatar component with variants, file upload with progress, and image
            crop UI
          </p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Avatar demo sections"
          className="flex gap-3 border-b border-gray-700"
        >
          <button
            role="tab"
            id="avatar-tab-components"
            aria-selected={activeTab === "components"}
            aria-controls="avatar-panel-components"
            onClick={() => setActiveTab("components")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
              activeTab === "components"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Components
          </button>
          <button
            role="tab"
            id="avatar-tab-uploader"
            aria-selected={activeTab === "uploader"}
            aria-controls="avatar-panel-uploader"
            onClick={() => setActiveTab("uploader")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
              activeTab === "uploader"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Avatar Uploader
          </button>
          <button
            role="tab"
            id="avatar-tab-a11y"
            aria-selected={activeTab === "a11y"}
            aria-controls="avatar-panel-a11y"
            onClick={() => setActiveTab("a11y")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/70 ${
              activeTab === "a11y"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            Accessibility
          </button>
        </div>

        {/* Content */}
        <div
          id="avatar-panel-components"
          role="tabpanel"
          aria-labelledby="avatar-tab-components"
          hidden={activeTab !== "components"}
          tabIndex={0}
        >
          <ComponentsView savedAvatar={savedAvatar} />
        </div>
        <div
          id="avatar-panel-uploader"
          role="tabpanel"
          aria-labelledby="avatar-tab-uploader"
          hidden={activeTab !== "uploader"}
          tabIndex={0}
        >
          <UploaderView onSave={setSavedAvatar} savedAvatar={savedAvatar} />
        </div>
        <div
          id="avatar-panel-a11y"
          role="tabpanel"
          aria-labelledby="avatar-tab-a11y"
          hidden={activeTab !== "a11y"}
          tabIndex={0}
        >
          <AccessibilityView />
        </div>
      </div>
    </div>
  );
}

function ComponentsView({ savedAvatar }: { savedAvatar?: string }) {
  const mockSrc =
    savedAvatar ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%2399102f'/%3E%3Ctext x='50%25' y='50%25' font-size='28' font-weight='500' fill='%23fff' text-anchor='middle' dy='.35em'%3EJD%3C/text%3E%3C/svg%3E";

  return (
    <div className="space-y-12">
      {/* Avatar Sizes */}
      <section className="bg-gray-800 rounded-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Avatar Sizes</h2>
          <p className="text-sm text-gray-400">
            24, 32, 40, and 64px variants with placeholder, initials, and image
            modes
          </p>
        </div>

        <div className="bg-gray-900 rounded p-6 space-y-8">
          {/* Size 24 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400">24px</h3>
            <div className="flex items-center gap-4">
              <Avatar size={24} src={mockSrc} alt="Avatar" />
              <Avatar size={24} name="Alice Cooper" />
              <Avatar size={24} />
            </div>
          </div>

          {/* Size 32 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400">32px</h3>
            <div className="flex items-center gap-4">
              <Avatar size={32} src={mockSrc} alt="Avatar" />
              <Avatar size={32} name="Bob Smith" />
              <Avatar size={32} />
            </div>
          </div>

          {/* Size 40 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400">40px</h3>
            <div className="flex items-center gap-4">
              <Avatar size={40} src={mockSrc} alt="Avatar" />
              <Avatar size={40} name="Charlie Davis" />
              <Avatar size={40} />
            </div>
          </div>

          {/* Size 64 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400">64px</h3>
            <div className="flex items-center gap-4">
              <Avatar size={64} src={mockSrc} alt="Avatar" />
              <Avatar size={64} name="Diana Prince" />
              <Avatar size={64} />
            </div>
          </div>
        </div>
      </section>

      {/* Avatar Variants */}
      <section className="bg-gray-800 rounded-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Avatar Variants</h2>
          <p className="text-sm text-gray-400">
            Auto-fallback from image → initials → placeholder
          </p>
        </div>

        <div className="bg-gray-900 rounded p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Image</h3>
            <div className="flex gap-4">
              <Avatar size={40} src={mockSrc} alt="Image variant" />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Displays image with border
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">Initials</h3>
            <div className="flex gap-4">
              {["Alice Brown", "Bob Jones", "Charlie Lee", "Diana Wu"].map(
                (name) => (
                  <Avatar key={name} size={40} name={name} />
                ),
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Derives initials, applies color by first letter
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Placeholder
            </h3>
            <div className="flex gap-4">
              <Avatar size={40} />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Default when no name or image provided
            </p>
          </div>
        </div>
      </section>

      {/* File Upload */}
      <section className="bg-gray-800 rounded-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">File Upload</h2>
          <p className="text-sm text-gray-400">
            Drag-and-drop or click, progress bar, cancellation, preview
          </p>
        </div>

        <div className="bg-gray-900 rounded p-6">
          <FileUpload
            accept="image/*"
            maxSizeMB={5}
            onUploadComplete={(file) =>
              logger.info("avatar.upload.complete", { fileName: file.file.name })
            }
            onCancel={(fileId) => logger.info("avatar.upload.cancelled", { fileId })}
          />
        </div>
      </section>

      {/* Design Spec */}
      <section className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-8 space-y-3">
        <h3 className="font-semibold text-blue-400 mb-2">Design Spec</h3>
        <ul className="space-y-2 text-sm text-blue-100">
          <li>✓ Avatar sizes: 24, 32, 40, 64px (per spec)</li>
          <li>✓ Upload dropzone keyboard accessible (focus/hover)</li>
          <li>✓ Crop handles 12px hit area (8–12px per spec)</li>
          <li>✓ All controls min 36px (pointer) / 44px (touch)</li>
          <li>✓ Progress bar, file preview, cancellation</li>
        </ul>
      </section>
    </div>
  );
}

function UploaderView({
  onSave,
  savedAvatar,
}: {
  onSave: (src: string) => void;
  savedAvatar?: string;
}) {
  return (
    <div className="space-y-8">
      <section className="bg-gray-800 rounded-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Avatar Uploader</h2>
          <p className="text-sm text-gray-400">
            Complete flow: upload → crop → save
          </p>
        </div>

        <div className="bg-gray-900 rounded p-8 max-w-2xl">
          <AvatarUploader name="User Name" size={64} onSave={onSave} />
        </div>

        {savedAvatar && (
          <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4">
            <p className="text-sm text-green-100">
              ✓ Avatar saved! Check the Components tab to see the updated
              avatar.
            </p>
          </div>
        )}
      </section>

      <section className="bg-gray-800 rounded-lg p-8 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Flow Steps</h2>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
              1
            </span>
            <div>
              <p className="font-medium">Upload</p>
              <p className="text-gray-400">
                Click avatar or drag/drop image file (max 5MB)
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
              2
            </span>
            <div>
              <p className="font-medium">Crop</p>
              <p className="text-gray-400">
                Adjust crop region, resize with corner handles
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
              3
            </span>
            <div>
              <p className="font-medium">Save</p>
              <p className="text-gray-400">
                Click &quot;Apply crop&quot; to save (returns 256×256 square output)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AccessibilityView() {
  return (
    <div className="space-y-8">
      <section className="bg-gray-800 rounded-lg p-8 space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Keyboard Navigation</h2>
        <div className="space-y-3">
          <div className="bg-gray-900 rounded p-4 space-y-2 text-sm text-gray-300">
            <p>
              <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">
                Tab
              </code>{" "}
              Navigate through all controls
            </p>
            <p>
              <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">
                Enter
              </code>{" "}
              Activate buttons, open upload
            </p>
            <p>
              <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">
                Space
              </code>{" "}
              Activate dropzone
            </p>
            <p>
              <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">
                Arrow Keys
              </code>{" "}
              Adjust crop area
            </p>
            <p>
              <code className="bg-gray-800 px-2 py-1 rounded text-blue-400">
                Mouse drag
              </code>{" "}
              Move crop region, resize with handles
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-800 rounded-lg p-8 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Screen Reader Support</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ Avatar: aria-label with name or &quot;No avatar&quot;</li>
          <li>✓ Upload dropzone: role=&quot;button&quot;, aria-label</li>
          <li>✓ Progress bar: role=&quot;progressbar&quot;, aria-valuenow</li>
          <li>
            ✓ Crop handles: aria-label identifies corner position (e.g.,
            &quot;nw resize handle&quot;)
          </li>
          <li>✓ File list items: descriptive names and status labels</li>
        </ul>
      </section>

      <section className="bg-gray-800 rounded-lg p-8 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Mobile & Touch</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ All controls: 44px minimum touch target</li>
          <li>✓ Dropzone: touch drag-and-drop, tap to browse</li>
          <li>✓ Crop handles: 12px hit area with padding</li>
          <li>✓ Progress: visual feedback via bar and percentage</li>
          <li>✓ No hover-only states</li>
        </ul>
      </section>

      <section className="bg-gray-800 rounded-lg p-8 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Focus Management</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ Focus visible on all interactive elements</li>
          <li>✓ Focus ring: 2px blue outline</li>
          <li>✓ Logical tab order through upload → crop → confirm</li>
          <li>✓ Escape key cancels crop and returns to upload</li>
        </ul>
      </section>

      <section className="bg-gray-800 rounded-lg p-8 space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Color Contrast</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✓ All text meets WCAG AA (4.5:1 for normal, 3:1 for large)</li>
          <li>✓ Progress bar: blue (#6366f1) on dark background</li>
          <li>✓ Initials: white on colored background (7:1+)</li>
          <li>✓ Error states: red (#ef4444) with sufficient contrast</li>
        </ul>
      </section>
    </div>
  );
}
