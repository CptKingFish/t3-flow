import s3Client from './s3-client';

const uploadToS3 = (bucket: string, key: string, body: Buffer, mimeType: string) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentEncoding: 'base64',
    ContentType: mimeType,
    ACL: 'public-read',
  };

  return s3Client.upload(params).promise();
};

export default uploadToS3;