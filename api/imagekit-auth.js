import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export default function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            message: "Method Not Allowed"
        });
    }

    const authParams = imagekit.getAuthenticationParameters();

    res.status(200).json(authParams);

}