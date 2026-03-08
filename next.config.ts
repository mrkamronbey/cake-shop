import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
