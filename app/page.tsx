"use client"
import { useEffect, useState } from "react"
import ImageUploading, { ImageListType } from "react-images-uploading"
import supabase from "@/utils/supabaseClient"
import Image from "next/image"

type Link = {
  title: string,
  link: string,
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [url, setUrl] = useState<string | undefined>();
  const [links, setLinks] = useState<Link[]>();
  const [images, setImages] = useState<ImageListType>([]);
  const onChange = (imageList: ImageListType) => {
    setImages(imageList);
  }
  const maxNumber = 69;

  useEffect(() => {
    const getUser = async () => {
      const user = await supabase.auth.getUser();
      console.log("user", user);
      if (user) {
        const userId = user.data.user?.id;
        setIsAuthenticated(true);
        setUserId(userId);
      }
    };

    getUser();
  }, [])

  useEffect(() => {
    const getLinks = async () => {
      try {
        const { data, error } = await supabase.from("links").select("title, link").eq("user_id", userId);

        if (error) throw error;
        setLinks(data);
        console.log("data: ", data);
      } catch (error) {
        console.log("error: ", error);
      }
    }
    if (userId) {
      getLinks();
    }
  }, [userId])

  const addNewLink = async () => {
    try {
      if (title && url && userId) {
        const { data, error } = await supabase.from("links").insert({
          title: title,
          link: url,
          user_id: userId
        }).select()
        if (error) throw error;
        console.log("data: ", data);
        if (links) {
          setLinks([...data, ...links]);
        }
      }
    }
    catch (error) {
      console.log("error: ", error);
    }
  }

  const uploadProfilePicture = async () => {
    try{
      if(images.length > 0){
        const image = images[0];
        if (image.file && userId){
          const {data, error} = await supabase.storage
          .from("public_assets")
          .upload(`${userId}/${image.file.name}`, image.file, {
            upsert: true
          });
          if(error) throw error;
          const resp = supabase.storage.from("public").getPublicUrl(data.path);
          const publicUrl = resp.data.publicUrl;
          const updateUserResponse = await supabase
          .from("users")
          .update({profile_picture_url: publicUrl})
          .eq("id", userId);
          if(updateUserResponse.error) throw error;
        }
      }
    }
    catch(error){
      console.log("error", error);
    }
  }

  return (
    <main className="flex justify-center flex-col h-screen items-center text-center pt-4">
      {links?.map((link: Link, index: number) => (
        <div
          onClick={(e) => {
            e.preventDefault();
            window.location.href = link.link;
          }}
          key={index}
          className="p-4 bg-indigo-400 w-4/12 text-white text-center mb-3 rounded-lg cursor-pointer"
        >{link.title}</div>
      ))}
      {isAuthenticated &&
        <>
          <div className="my-3">
            <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="title">
              Title
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="title"
              name="title"
              type="text"
              placeholder="enter title"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="my-3">
            <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="url">
              URL
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="url"
              name="url"
              type="text"
              placeholder="enter url"
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            onClick={addNewLink}
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-4">
            Add New Link
          </button>
          <div>
            {/* {images.length > 0 && (
              <Image src={images[0]["data_url"]} width={100} height={100} alt="profile pic" />
            )} */}

            <ImageUploading
              multiple
              value={images}
              onChange={onChange}
              maxNumber={maxNumber}
              dataURLKey="data_url"
            >
              {({
                imageList,
                onImageUpload,
                onImageRemoveAll,
                onImageUpdate,
                onImageRemove,
                isDragging,
                dragProps,
              }) => (
                // write your building UI
                <div className="upload__image-wrapper">
                  <button
                    style={isDragging ? { color: 'red' } : undefined}
                    onClick={onImageUpload}
                    {...dragProps}
                  >
                    Click or Drop here
                  </button>
                  &nbsp;
                  <button onClick={onImageRemoveAll}>Remove all images</button>
                  {imageList.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image['data_url']} alt="" width="100" />
                      <div className="image-item__btn-wrapper">
                        <button onClick={() => onImageUpdate(index)}>Update</button>
                        <button onClick={() => onImageRemove(index)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ImageUploading>
            <button onClick={uploadProfilePicture}>Upload Profile Pic</button>
          </div>
        </>
      }
    </main>
  )
}
