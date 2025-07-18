import Image from "next/image";
import FileUploadComponent from "./components/file-upload";

export default function Home() {
  return (
   <div className="min-h-screen w-screen flex">
     <div className="w-[30vw] min-h-screen flex justify-center items-center bg-yellow-200">
      <FileUploadComponent />
     </div>
     <div className="w-[70vw] min-h-screen bg-cyan-200 border-l-8 border-white"></div>
   </div>
  );
}
