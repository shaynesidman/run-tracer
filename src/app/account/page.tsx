import AccountInfo from "@/components/AccountInfo";
import AllRuns from "@/components/AllRuns";

export default function Account() {

    return (
        <section className="h-full max-w-4xl w-full p-4 mx-auto flex flex-col justify-center items-center gap-8">
            <AccountInfo />
            <AllRuns />
        </section>
    );
}