
import { createContext, useEffect, useState } from "react";
import { main } from "../config/gemini";

export const AppContext  = createContext();

const ContextProvider = (props) => {
  
  const [input,setInput] = useState("");
  const [recentPrompt,setRecentPrompt] = useState("");
  const [prevPrompts,setPrevPrompts] =useState([]);
  const [showResult,setShowResult] = useState(false);
  const [loading,setLoading] = useState(false);
  const [resultData,setResultData] = useState("");
  const delayPara = (index,nextWord)=>{
    setTimeout(function(){
        setResultData(prev=>prev+nextWord);
    },75*index)
  }

  const newChat = ()=>{
    setLoading(false)
    setShowResult(false)
  }

  const onSent = async (prompt) => {
  try {
    setResultData("");
    setLoading(true);
    setShowResult(true);

    const finalPrompt = prompt ?? input; 
    if (!finalPrompt || finalPrompt.trim() === "") return;

    setPrevPrompts(prev => {
      return prev.includes(finalPrompt) ? prev : [...prev, finalPrompt];
    });

    setRecentPrompt(finalPrompt);
    const response = await main(finalPrompt);

    
    let responseArray = response.split("**");
    let newResponse = "";
    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 !== 1) {
        newResponse += responseArray[i];
      } else {
        newResponse += "<b>" + responseArray[i] + "</b>";
      }
    }
    let newResponse2 = newResponse.split("*").join("</br>");
    let newResponseArray = newResponse2.split(" ");
    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      delayPara(i, nextWord + " ");
    }

    setLoading(false);
    setInput("");
    return response;

  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    setLoading(false);
  }
};


  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat
  };

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
};

export default ContextProvider;
