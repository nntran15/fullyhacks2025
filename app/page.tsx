import Image from "next/image";

export default function Home() {
  return (
    <div>  
        <p className="text-6xl font-seriff font-semibold tracking-[-.05em] text-center sm:text-center absolute bottom-100 left-85 align-middle text-orange-600 dark:text-orange-400">
          CSUF Course Planner
        </p>
        <img
          src="https://i.imgur.com/bZCmhmB.png"
          alt="asteroid"
          width={300}
          height={300}
          className="absolute bottom-30 left-25 align-middle"
        />
        <img
          src="https://i.imgur.com/RHUhbUE.png"
          alt="gnarp gnarp"
          width={150}
          height={150}
          className="absolute bottom-70 left-30 align-middle"
        />
        <img
          src="https://i.imgur.com/F6Qzapj.png"
          alt="ufo"
          width={300}
          height={300}
          className="absolute bottom-45 left-225 align-middle"
        />
        <img
          src="https://i.imgur.com/TqaLD70.png"
          alt="glorbius"
          width={90}
          height={90}
          className="absolute bottom-70 left-251 align-middle"
        />
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            </ol>
            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <a
                className="text-zinc-800 object-center rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#888585] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                href="http://localhost:3000/test2" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="dark:invert"
                  src="/vercel.svg"
                  alt="Vercel logomark"
                  width={20}
                  height={20}
                />
                Plan your courses
              </a>
              </div>
          </main>
          <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
            </footer>
        </div>
      </div>
  );
}
