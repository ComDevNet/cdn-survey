"use client";
import { useRouter } from "next/navigation";
import { FaFileAlt, FaTable, FaEye } from "react-icons/fa"; // Example icons

export default function LandingPage() {
  const router = useRouter();

  const navigateToCreate = () => {
    router.push("/create");
  };

  const navigateToEdit = () => {
    router.push("/edit");
  };

  const navigateToView = () => {
    router.push("/view");
  };

  return (
    <div className="container mx-auto p-4 text-center mt-14">
      <h1 className="text-4xl font-bold mb-6 md:text-6xl">CDN Survey Creator</h1>
      <p className="mb-20 text-lg">Create, Edit and View surveys to be placed on local CDN Servers</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-7xl mx-auto">
        {/* Create Box */}
        <div
          onClick={navigateToCreate}
          className="group flex flex-col items-center justify-center border-2 border-green-500 rounded-xl p-14 cursor-pointer bg-green-500 md:bg-transparent hover:bg-green-500 transition-all duration-300"
        >
          <FaFileAlt className="text-white md:text-green-500 text-6xl mb-4 group-hover:text-white" /> {/* Icon turns white */}
          <span className="text-xl font-bold text-white md:text-gray-800 group-hover:text-white">
            Create
          </span>
        </div>

        {/* Edit Box */}
        <div
          onClick={navigateToEdit}
          className="group flex flex-col items-center justify-center border-2 border-blue-500 rounded-xl p-14 cursor-pointer bg-blue-500 md:bg-transparent hover:bg-blue-500 transition-all duration-300"
        >
          <FaTable className="text-white md:text-blue-500 text-6xl mb-4 group-hover:text-white" /> {/* Icon turns white */}
          <span className="text-xl font-bold text-white md:text-gray-800 group-hover:text-white">
            Edit
          </span>
        </div>

        {/* View Box */}
        <div
          onClick={navigateToView}
          className="group flex flex-col items-center justify-center border-2 border-yellow-500 rounded-xl p-14 cursor-pointer md:bg-transparent bg-yellow-500 hover:bg-yellow-500 transition-all duration-300"
        >
          <FaEye className="text-white md:text-yellow-500 text-6xl mb-4 group-hover:text-white" /> {/* Icon turns white */}
          <span className="text-xl font-bold text-white md:text-gray-800 group-hover:text-white">
            View
          </span>
        </div>
      </div>
    </div>
  );
}
