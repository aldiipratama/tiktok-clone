import { useEffect, useState } from "react";
import { SanityAssetDocument } from "@sanity/client";
import { useRouter } from "next/router";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axios from "axios";

import useAuthStore from "../store/authStore";
import { BASE_URL } from "../utils";
import { client } from "../utils/client";
import { topics } from "../utils/constants";

const Upload = () => {
  const [caption, setCaption] = useState("");
  const [topic, setTopic] = useState<String>(topics[0].name);
  const [loading, setLoading] = useState<Boolean>(false);
  const [savingPost, setSavingPost] = useState<Boolean>(false);
  const [videoAsset, setVideoAsset] = useState<
    SanityAssetDocument | undefined
  >();
  const [wrongFileType, setWrongFileType] = useState<Boolean>(false);

  const userProfile: any = useAuthStore((state) => state.userProfile);
  const router = useRouter();

  useEffect(() => {
    if (!userProfile) router.push("/");
  }, [userProfile, router]);

  const uploadVideo = async (e: any) => {
    const selectedFile = e.target.files[0];
    const fileTypes = ["video/mp4", "video/webm", "video/ogg"];

    // uploading asset to sanity
    if (fileTypes.includes(selectedFile.type)) {
      setWrongFileType(false);
      setLoading(true);

      client.assets
        .upload("file", selectedFile, {
          contentType: selectedFile.type,
          filename: selectedFile.name,
        })
        .then((data) => {
          setVideoAsset(data);
          setLoading(false);
        });
    } else {
      setLoading(false);
      setWrongFileType(true);
    }
  };

  const handlePost = async () => {
    if (caption && videoAsset?._id && topic) {
      setSavingPost(true);

      const doc = {
        _type: "post",
        caption,
        video: {
          _type: "file",
          asset: {
            _type: "reference",
            _ref: videoAsset?._id,
          },
        },
        userId: userProfile?._id,
        postedBy: {
          _type: "postedBy",
          _ref: userProfile?._id,
        },
        topic,
      };

      await axios.post(`${BASE_URL}/api/post`, doc);

      router.push("/");
    }
  };

  const handleDiscard = () => {
    setSavingPost(false);
    setVideoAsset(undefined);
    setCaption("");
    setTopic("");
  };

  return (
    <div className="flex w-full h-full absolute left-0 top-[60px] lg:top-[70px] mb-10 pt-10 lg:pt-20 bg-[#F8F8F8] justify-center">
      <div className=" bg-white rounded-lg xl:h-[80vh] flex gap-6 flex-wrap justify-center items-center p-14 pt-6">
        <div>
          <div>
            <p className="text-2xl font-bold">Upload Video</p>
            <p className="mt-1 text-gray-400 text-md">
              Post a video to your account
            </p>
          </div>
          <div className=" border-dashed rounded-xl border-4 border-gray-200 flex flex-col justify-center items-center  outline-none mt-10 w-[260px] h-[458px] p-10 cursor-pointer hover:border-red-300 hover:bg-gray-100">
            {loading ? (
              <p className="text-3xl font-semibold text-center text-red-400">
                Uploading...
              </p>
            ) : (
              <div>
                {!videoAsset ? (
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-xl font-bold">
                          <FaCloudUploadAlt className="text-6xl text-gray-300" />
                        </p>
                        <p className="text-xl font-semibold">
                          Select video to upload
                        </p>
                      </div>

                      <p className="mt-10 text-sm leading-10 text-center text-gray-400">
                        MP4 or WebM or ogg <br />
                        720x1280 resolution or higher <br />
                        Up to 10 minutes <br />
                        Less than 2 GB
                      </p>
                      <p className="bg-[#F51997] text-center mt-8 rounded text-white text-md font-medium p-2 w-52 outline-none">
                        Select file
                      </p>
                    </div>
                    <input
                      type="file"
                      name="upload-video"
                      onChange={(e) => uploadVideo(e)}
                      className="w-0 h-0"
                    />
                  </label>
                ) : (
                  <div className=" rounded-3xl w-[300px]  p-4 flex flex-col gap-6 justify-center items-center">
                    <video
                      className="rounded-xl h-[462px] mt-16 bg-black"
                      controls
                      loop
                      src={videoAsset?.url}
                    />
                    <div className="flex justify-between gap-20 ">
                      <p className="text-lg">{videoAsset.originalFilename}</p>
                      <button
                        type="button"
                        className="p-2 text-xl text-red-400 transition-all duration-500 ease-in-out bg-gray-200 rounded-full outline-none cursor-pointer hover:shadow-md"
                        onClick={() => setVideoAsset(undefined)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {wrongFileType && (
            <p className="text-center text-xl text-red-400 font-semibold mt-4 w-[260px]">
              Please select an video file (mp4 or webm or ogg)
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 pb-10">
          <label className="font-medium text-md ">Caption</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="p-2 border-2 border-gray-200 rounded outline-none lg:after:w-650 text-md"
          />
          <label className="font-medium text-md ">Choose a topic</label>

          <select
            onChange={(e) => {
              setTopic(e.target.value);
            }}
            className="p-2 capitalize border-2 border-gray-200 rounded outline-none cursor-pointer lg:w-650 text-md lg:p-4"
          >
            {topics.map((item) => (
              <option
                key={item.name}
                className="p-2 text-gray-700 capitalize bg-white outline-none text-md hover:bg-slate-300"
                value={item.name}
              >
                {item.name}
              </option>
            ))}
          </select>
          <div className="flex gap-6 mt-10">
            <button
              onClick={handleDiscard}
              type="button"
              className="p-2 font-medium border-2 border-gray-300 rounded outline-none text-md w-28 lg:w-44"
            >
              Discard
            </button>
            <button
              disabled={videoAsset?.url ? false : true}
              onClick={handlePost}
              type="button"
              className="bg-[#F51997] text-white text-md font-medium p-2 rounded w-28 lg:w-44 outline-none"
            >
              {savingPost ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
