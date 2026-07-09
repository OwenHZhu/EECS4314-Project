export default function Comment() {
    return (
        <div>
            {/* User information */}
            <div className="flex flex-row">
                {/* Profile pic */}
                <div className="w-[50px] h-[50px] bg-[#923F3F] rounded-full"></div>

                {/* User information and date commented */}
                <div className="ml-2 mt-1">
                    <h4 className="text-sm text-[#998888]">User1234</h4>
                    <p className="text-xs text-[#5A4B4B]">Month X, Year</p>
                </div>
            </div>

            {/* Comment content */}
            <p className="text-sm text-[#C6C1B3] ml-12">
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            </p>
        </div>
    );
}