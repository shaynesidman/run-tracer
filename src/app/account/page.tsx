import AccountInfo from "@/components/AccountInfo";
import AllRuns from "@/components/AllRuns";

export default function Account() {

    return (
        <section className="h-full w-full max-w-5xl px-4 mx-auto flex flex-col justify-center items-center gap-8">
            <AccountInfo />
            <AllRuns />
        </section>
    );
}