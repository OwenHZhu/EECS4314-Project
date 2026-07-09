
import GenericButton from "../../components/generic/GenericButton.jsx";
import GenericInput from "../../components/generic/GenericInput.jsx";
import Comment from "./Comment.jsx";

export default function PostPage({ postId, bookId }) {

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <title>Post Name | username</title>
            <p className="text-sm text-[#7E7272]">COMMUNITY</p>

            {/* Post Information */}
            <div className="flex flex-row">
                {/* Book Cover Placeholder */}
                <div
                    className="w-[114px] h-[171px] bg-slate-900 rounded-lg m-3"
                />

                <div className="m-3">
                    <p className="text-sm text-[#7E7272]">Dune | Frank Herbert</p>
                    <h2 className="mt-2 text-2xl text-[#C6C1B3] font-bold">Did Paul make the right choice?</h2>
                    <h4 className="text-sm text-[#7E7272]">by User123</h4>
                    <p className="text-sm mt-1 text-[#7E7272]/80">Month X, Year</p>
                </div>
            </div>

            {/* Category Label */}
            <GenericButton
                disable
                cursor-none
                variant="spoilers"
                className="py-2 px-3 m-3"
            >
                Spoilers
            </GenericButton>

            {/* Post Content */}
            <div className="bg-[#170E0F/65] border border-[#727C7E] w-full h-fit rounded-lg mt-5">
                <p className="text-[#C6C1B3] p-5">
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                </p>

                {/* TO-DO: Add comment image in here */}
                <div className="m-3">
                    <GenericButton
                        variant="ghost"
                        className="py-2 px-3 mr-3"
                    >
                        Comments
                    </GenericButton>

                    {/* TO-DO: Add heart image in here */}
                    <GenericButton
                        variant="ghost"
                        className="py-2 px-3"
                    >
                        Likes
                    </GenericButton>
                </div>
            </div>

            {/* Input for adding a reply */}
            <GenericInput
                placeholder="Reply"
                variant="reply"
                className="bg-transparent border py-2 px-3 my-6 w-full text-sm text-[#C6C1B3]"
            />

            <Comment></Comment>

        </div>
    );
}