import s3Client from "./s3-client";

const deleteFromS3 = (bucket: string, key: string) => {
    const params = {
        Bucket: bucket,
        Key: key,
    };

    return s3Client.deleteObject(params).promise();
}

export default deleteFromS3;