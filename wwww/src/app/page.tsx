import Image from "next/image";
// import { IoLogoGithub } from "react-icons/io";

import { ROADMAP } from "@/lib/roadmap";
import { cn } from "@/lib/utils";
import { REPO_URL, X_URL } from "@/lib/constants";
import { Button } from "@/components/button";

function Page() {
  return (
    <div
      className="bg-zinc-950 min-h-dvh py-4 md:py-14 font-roboto-mono text-zinc-50 flex flex-col justify-center items-center max-w-3xl mx-auto"
    >
      <header className="flex flex-row items-center justify-between gap-2 w-full px-4 pb-6">
        <Image
          src="/icon.svg"
          alt="hviz logo"
          width={32}
          height={32}
          className="border rounded-md group size-8 duration-300 group-hover:scale-105 transition-all hover:shadow-xl hover:shadow-neutral-800/50"
        />

        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <Button
            variant="ghost"
            className="dark:group-hover:text-neutral-300 size-8 text-zinc-400"
          >
            github
            {/* <IoLogoGithub /> */}
          </Button>
        </a>
      </header>

      <div className="text-center">
        <h1 className="text-6xl pb-2 border-b-4 mb-2 border-green-700">hviz</h1>
        <p className="text-neutral-300 text-xs">
          CLI tool for visualizing your database schema
        </p>
      </div>

      <div className="flex md:flex-row flex-col gap-6 pt-14 px-4 pb-14">
        <div className="flex flex-col gap-4">
          <p className="border-l-4 pl-2 text-lg border-green-700">join waitlist</p>
          <p className="text-xs">
            hviz is in active development and not yet production-ready. Sign up to
            stay updated!
          </p>
          {/* <Wishlist client:load /> */}
        </div>

        <div className="flex flex-col gap-4">
          <p className="border-l-4 pl-2 text-lg border-green-700">roadmap</p>
          <p className="text-xs">
            Our progress toward a robust ERD generator. Here's what's in the
            works:
          </p>
          <div className="flex flex-col gap-4">
            {
              ROADMAP.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col gap-1"
                >
                  <div className="flex flex-row gap-2 items-center">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        item.status === "in progress" || item.status === "done"
                          ? "bg-green-700"
                          : "bg-neutral-500"
                      )}
                    />
                    <p className="text-lg">{item.title}</p>
                  </div>

                  <p className="text-sm text-neutral-400">{item.subtitle}</p>

                  {item.subFeatures && item.subFeatures.length > 0 && (
                    <ul className="flex flex-row gap-1 flex-wrap">
                      {item.subFeatures.map((subFeature, index) => {
                        return (
                          <li
                            className="flex items-center flex-row gap-0 text-sm"
                            key={subFeature.title}
                          >
                            <span
                              className={cn(
                                "text-neutral-500",
                                subFeature.status === "in progress" ||
                                  subFeature.status === "done"
                                  ? "text-green-700"
                                  : "text-neutral-500"
                              )}
                            >
                              {subFeature.title}
                            </span>
                            {item.subFeatures &&
                              index < item.subFeatures.length - 1 && (
                                <span className="text-neutral-500">,</span>
                              )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <p
                    className={cn(
                      "text-xs",
                      item.status === "in progress" || item.status === "done"
                        ? "text-green-700"
                        : "text-neutral-500"
                    )}
                  >
                    {item.status}
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <hr className="w-full border-zinc-800" />

      <p className="text-xs text-zinc-300 pt-6">
        © 2025 hviz — <a
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-green-700 transition-colors"
        >
          @husamql3
        </a>
      </p>
    </div>
  );
}

export default Page;