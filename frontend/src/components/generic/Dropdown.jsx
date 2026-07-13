export default function Dropdown({openSettings, setOpenSettings, trigger, children }) {
  return (
    <div className="relative inline-block">
      <div onClick={() => setOpenSettings(!openSettings)}>
        {trigger}
      </div>

      {openSettings && (
        <div
          className="absolute right-0 left-5 mt-2 w-fit h-fit bg-[#1A2523] 
          shadow-lg rounded-md p-4 z-50 border-2 border-[#00FFCC]"
        >
          {children}
        </div>
      )}
    </div>
  );
}