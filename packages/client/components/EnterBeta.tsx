import axios from "axios";
import { useState } from "react";
import { API_URL } from "../lib/constants";

export const EnterBeta = (props: { data: any }) => {
  const joinedBeta = props.data?.user?.betaUser;
  const [accessCode, setAccessCode] = useState("");
  const [accessCodeError, setAccessCodeError] = useState("");

  const joinBetaHandler = async () => {
    if (accessCode === process.env.NEXT_PUBLIC_BETA_ACCESS_CODE) {
      await axios.get(`${API_URL}/@me/beta`, {
        withCredentials: true,
      });

      window.location.reload();
    } else {
      setAccessCodeError("incorrect passphrase. try again?");
    }
  };

  return (
    <>
      {props.data.user && !joinedBeta && (
        <>
          <div className="flex flex-col items-center justify-center">
            <span className="mb-3">Enter the passphrase to join the beta.</span>
            <input
              className={`w-[150px] px-5 py-3 text-secondary bg-navbar rounded-lg display-none md:block"
                }`}
              onChange={(e) => setAccessCode(e.target.value)}
            />
            {accessCodeError ? (
              <div className="flex items-center justify-center mt-5">
                <span className="w-[410px] text-red-500 text-center">
                  {accessCodeError}
                </span>
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <div className="flex items-center justify-center mt-5">
            <button
              onClick={joinBetaHandler}
              className={`group bg-navbar px-5 py-3 flex items-center text-sm w-auto rounded-lg cursor-pointer transition ease-out hover:bg-primary hover:text-black text-center text-secondary`}
            >
              submit
            </button>
          </div>
        </>
      )}
    </>
  );
};
