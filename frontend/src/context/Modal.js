import React, { useRef, useState, useContext } from "react";
import ReactDOM from "react-dom";
import "./Modal.css";

const ModalContext = React.createContext();

export function ModalProvider({ children }) {
  const ref = useRef();
  const [modalContent, setModalContent] = useState(null);
  // callback function that will be called when modal is closing
  const [onModalClose, setOnModalClose] = useState(null);

  const closeModal = () => {
    setModalContent(null); // close the modal by setting the modal contents to null
    // if callback function is truthy, call the callback function and reset it to null
    if (typeof onModalClose === "function") {
      setOnModalClose(null);
      onModalClose();
    }
  };

  const contextValue = {
    ref, // reference to modal div
    modalContent, // React component to render inside modal
    setModalContent, // function to set the React component to render inside modal
    setOnModalClose, // function to set the callback function to be called when modal is closing
    closeModal, // function to close the modal
  };

  return (
    <>
      <ModalContext.Provider value={contextValue}>
        {children}
      </ModalContext.Provider>
      <div ref={ref} />
    </>
  );
}

export function Modal() {
  const { ref, modalContent, closeModal } = useContext(ModalContext);
  // if there is no div referenced by the ref or modalContent is not a truthy value, render nothing:
  if (!ref || !ref.current || !modalContent) return null;

  // render the following component to the div referenced by the ref
  return ReactDOM.createPortal(
    <div id="modal">
      <div id="modal-background" onClick={closeModal} />
      <div id="modal-content">{modalContent}</div>
    </div>,
    ref.current
  );
}


export const useModal = () => useContext(ModalContext);
