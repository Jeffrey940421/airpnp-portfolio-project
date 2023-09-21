import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import * as sessionActions from "./store/session";
import { Navigation } from "./components/Navigation";
import { SpotList } from "./components/SpotList";
import { CreateSpotContainer } from "./components/CreateSpot";
import { SpotDetail } from "./components/SpotDetail";
import { ManageReviews } from "./components/ManageReviews";
import { Error } from "./components/Error";
import { Reserve } from "./components/Reserve";
import { Footer } from "./components/Footer";
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { csrfFetch } from "./store/csrf";
import parse from "html-react-parser";

function Editor() {
  const [data, setData] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState("")
  const custom_config = {
    extraPlugins: [MyCustomUploadAdapterPlugin],
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'blockQuote',
        'insertTable',
        '|',
        'imageUpload',
        'imageToolbar',
        'imageStyle',
        'imageResize',
        'undo',
        'redo'
      ]
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },
    placeholder: "Title",
    initialData: "<h1><br></h1>"
  }
  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader)
    }
  }
  class MyUploadAdapter {
    constructor(props) {
      // CKEditor 5's FileLoader instance.
      this.loader = props;
      // URL where to send files.
      this.url = `/spots/test`;
    }

    // Starts the upload process.
    async upload() {
      // const formData = new FormData();
      const file = await this.loader.file
      // console.log(file)
      // formData.append('image', file)
      // const res = await csrfFetch("/api/spots/test", {
      //   method: "POST",
      //   body: formData
      // })
      // return await res.json()
      const url = URL.createObjectURL(file)
      setImage((prev) => {
        return { ...prev, [url]: file }
      })
      console.log(url)
      return { default: url }
    }

    // Aborts the upload process.
    abort() {
    }

  }
  return (
    <>
      <CKEditor
        required
        editor={ClassicEditor}
        config={custom_config}
        data={data}
        onChange={(event, editor) => {
          setData(editor.getData())
        }}
      />
      {content}
      <button
        onClick={async (e) => {
          const formData = new FormData();
          const currentImages = []
          parse(data, {
            replace: domNode => {
              if (domNode.name === "img") {
                currentImages.push(domNode.attribs.src)
              }
            }
          })
          for (let img in image) {
            if (currentImages.includes(img)) {
              formData.append('images', image[img])
            }
          }
          const res = await csrfFetch("/api/spots/test2", {
            method: "POST",
            body: formData
          })
          const temp = await res.json()
          const urls = temp.urls
          console.log(urls)
          setContent((prev) => {
            return parse(data, {
              replace: domNode => {
                if (domNode.name === "img") {
                  domNode.attribs.src = urls[0]
                  domNode.attribs.height = "200px"
                  urls.shift()
                  return domNode
                }
                if (domNode.name === "p") {
                  domNode.attribs.style = { color: "red" }
                  return domNode
                }
              }
            })
          })
        }}
      >
        upload
      </button>
    </>
  )
}

export default Editor;
