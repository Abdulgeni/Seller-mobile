export interface StorageUploadOptions {
  contentType?: string;
  upsert?: boolean;
}

export interface StorageUploadData {
  path: string;
  publicUrl: string;
  sizeBytes: number;
}

export interface StorageError {
  message: string;
  statusCode: number;
}

export interface StorageUploadResult {
  data: StorageUploadData | null;
  error: StorageError | null;
}

export interface StorageBucketRef {
  upload(
    filePath: string,
    fileData: string | Blob | ArrayBuffer,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult>;
  getPublicUrl(filePath: string): { data: { publicUrl: string } };
  remove(filePaths: string[]): Promise<{ data: string[] | null; error: StorageError | null }>;
}

export interface StorageClient {
  from(bucket: string): StorageBucketRef;
}

export class MockStorageBucketRef implements StorageBucketRef {
  private files = new Map<string, { sizeBytes: number; contentType: string }>();

  constructor(
    private readonly bucketName: string,
    private readonly baseUrl: string = "https://mock-storage.seller.internal",
    private readonly simulatedLatencyMs: number = 0
  ) {}

  async upload(
    filePath: string,
    fileData: string | Blob | ArrayBuffer,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    if (this.simulatedLatencyMs > 0) {
      await new Promise((res) => setTimeout(res, this.simulatedLatencyMs));
    }

    if (!filePath || filePath.trim().length === 0) {
      return {
        data: null,
        error: { message: "Invalid file path", statusCode: 400 },
      };
    }

    let sizeBytes = 0;
    if (typeof fileData === "string") {
      sizeBytes = Buffer.byteLength(fileData, "utf8");
    } else if (fileData instanceof ArrayBuffer) {
      sizeBytes = fileData.byteLength;
    } else if (typeof Blob !== "undefined" && fileData instanceof Blob) {
      sizeBytes = fileData.size;
    }

    // Hard gate: max 200 KB upload limit for product images
    if (sizeBytes > 200 * 1024) {
      return {
        data: null,
        error: {
          message: `File size ${sizeBytes} exceeds maximum allowed budget of 204800 bytes (200 KB)`,
          statusCode: 413,
        },
      };
    }

    this.files.set(filePath, {
      sizeBytes,
      contentType: options?.contentType ?? "image/jpeg",
    });

    const publicUrl = `${this.baseUrl}/${this.bucketName}/${filePath}`;
    return {
      data: {
        path: filePath,
        publicUrl,
        sizeBytes,
      },
      error: null,
    };
  }

  getPublicUrl(filePath: string): { data: { publicUrl: string } } {
    return {
      data: {
        publicUrl: `${this.baseUrl}/${this.bucketName}/${filePath}`,
      },
    };
  }

  async remove(filePaths: string[]): Promise<{ data: string[] | null; error: StorageError | null }> {
    const deleted: string[] = [];
    for (const p of filePaths) {
      if (this.files.delete(p)) {
        deleted.push(p);
      }
    }
    return { data: deleted, error: null };
  }

  hasFile(filePath: string): boolean {
    return this.files.has(filePath);
  }
}

export class MockStorageClient implements StorageClient {
  private buckets = new Map<string, MockStorageBucketRef>();

  constructor(
    private readonly baseUrl: string = "https://mock-storage.seller.internal",
    private readonly simulatedLatencyMs: number = 0
  ) {}

  from(bucket: string): StorageBucketRef {
    let bucketRef = this.buckets.get(bucket);
    if (!bucketRef) {
      bucketRef = new MockStorageBucketRef(bucket, this.baseUrl, this.simulatedLatencyMs);
      this.buckets.set(bucket, bucketRef);
    }
    return bucketRef;
  }
}

export const defaultStorageClient = new MockStorageClient();
