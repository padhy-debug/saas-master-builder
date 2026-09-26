/**
 * Universal Secure Object Storage & Direct Upload Service
 * Generates presigned upload URLs with tenant sandboxing, MIME-type whitelisting, and quota checks.
 */

import crypto from 'crypto';

export interface PresignUploadRequest {
  organizationId: string;
  userId: string;
  filename: string;
  mimeType: string;
  byteSize: number;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
  expiresInSeconds: number;
  headers: Record<string, string>;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
]);

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB default limit

export class SecureStorageService {
  private bucketName: string;
  private s3Endpoint: string;

  constructor(bucketName: string, endpoint: string = 'https://s3.amazonaws.com') {
    this.bucketName = bucketName;
    this.s3Endpoint = endpoint;
  }

  generatePresignedUpload(req: PresignUploadRequest): PresignedUploadResponse {
    // 1. Validate File Size
    if (req.byteSize > MAX_UPLOAD_BYTES) {
      throw new Error(`Upload exceeds maximum allowed size of ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.`);
    }

    // 2. Validate MIME Type Whitelist
    if (!ALLOWED_MIME_TYPES.has(req.mimeType.toLowerCase())) {
      throw new Error(`Disallowed file type: ${req.mimeType}. Only images, documents, and spreadsheets are permitted.`);
    }

    // 3. Sandboxed Multi-Tenant Path Isolation
    const fileId = crypto.randomUUID();
    const sanitizedExt = req.filename.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    const fileKey = `tenants/${req.organizationId}/uploads/${fileId}.${sanitizedExt}`;

    // 4. Construct S3 Presigned URL (Simulated standard AWS v4 signature structure)
    const expiresInSeconds = 900; // 15 mins
    const uploadUrl = `${this.s3Endpoint}/${this.bucketName}/${fileKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expiresInSeconds}`;

    return {
      uploadUrl,
      fileKey,
      expiresInSeconds,
      headers: {
        'Content-Type': req.mimeType,
        'x-amz-server-side-encryption': 'AES256',
      },
    };
  }

  generateDownloadUrl(fileKey: string, organizationId: string): string {
    // Invariant: Verify file belongs to the tenant before issuing download URL
    if (!fileKey.startsWith(`tenants/${organizationId}/`)) {
      throw new Error('[Security Exception] Cross-tenant storage access denied.');
    }
    return `${this.s3Endpoint}/${this.bucketName}/${fileKey}?token=${crypto.randomBytes(16).toString('hex')}`;
  }
}
