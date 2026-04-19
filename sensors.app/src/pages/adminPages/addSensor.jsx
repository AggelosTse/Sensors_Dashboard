import { useState } from "react";
import { useNavigate } from "react-router-dom";


export function AddSensors() {

    const [name, setName] = useState("");
    const [metadata, setMetadata] = useState("");
    const [category, setCategory] = useState("Humidity");

    const [serverMessage, setMessage] = useState("");
    const [serverMessageType, setMessageType] = useState("");

    const [sending, setSending] = useState(false); //to prevent spamming button

    const navig = useNavigate();

    async function handleAddSensor() {
        if (sending) return; //if true, button is already doing a task

        setSending(true);
        console.log(name, metadata, category);

        if (
            !name.trim() ||
            !metadata.trim() ||
            !category.trim()

        ) {
            setTimeout(() => {
                setMessage("Missing Input");
                setMessageType("Error");
            }, 700);

            setTimeout(() => {
                setSending(false);
            }, 2200);
            return;
        }

        const response = await fetch("http://localhost:8001/addsensor", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                metadata: metadata,
                category: category
            }),
        });

        const data = await response.json();
        if (response.ok) {
            setMessage(data.message);
            setMessageType(data.messagetype);

            setTimeout(() => {

                setSending(false);
                navig("/control_panel");
            }, 2200);
        } else {
            setTimeout(() => {
                setMessage(data.message);
                setMessageType(data.messagetype);
            }, 700);

            setTimeout(() => {
                setSending(false);
            }, 2200);
        }
    }


    return (
        <div>
            <Logo />
            <Fields
                name={name}
                setName={setName}
                metadata={metadata}
                setMetadata={setMetadata}
                category={category}
                setCategory={setCategory}
                handleAddSensor={handleAddSensor}
                sending={sending}
            />

            <ServerMessage message={serverMessage} messagetype={serverMessageType} />
        </div>
    );
}


function Logo() {
    return <h1>ADD SENSOR</h1>;
}
function Fields({
    name,
    setName,
    metadata,
    setMetadata,
    category,
    setCategory,
    handleAddSensor,
    sending
}) {
    return (
        <div>
            <input
                type="text"
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
            />{" "}
            <br />
            <input
                type="text"
                placeholder="Metadata"
                onChange={(e) => setMetadata(e.target.value)}
            />
            <br />
            <label htmlFor="options">Categories</label>
            <br />
            <select
                name="sensortype"
                id="sensortype"
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="Humidity">HUMIDITY</option>
                <option value="Temperature">TEMPERATURE</option>
            </select>
            <br />
            <button onClick={handleAddSensor} disabled={sending}>
                {sending ? "Sending..." : "ADD SENSOR"}
            </button>
        </div>
    );
}


function ServerMessage({ message, messagetype }) {
    if (!message) return null;

    if (messagetype == "Error") {
        return <p className="statusMessageError">{message}</p>;
    } else {
        return <p className="statusMessageValid">{message}</p>;
    }
}