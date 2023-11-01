import { type AppType,AppProps } from "next/app";

import { api } from "~/@/utils/api";

import "~/@/styles/globals.css";
import { createContext, useContext, useState } from "react";

interface EditContextProps {
  edit: boolean;
  setEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditContext = createContext<EditContextProps | undefined>(undefined);

export const useEditContext = (): EditContextProps => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEditContext must be used within an EditContext.Provider');
  }
  return context;
};

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  const [edit, setEdit] = useState<boolean>(false);

  return (
    <>
      <EditContext.Provider value={{ edit, setEdit }}>
        <Component {...pageProps} />
      </EditContext.Provider>
    </>
  );
};

export default api.withTRPC(MyApp);

