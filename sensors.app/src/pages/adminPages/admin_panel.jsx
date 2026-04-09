import { useNavigate } from "react-router-dom";

export function AdminPanel(){

    const navig = useNavigate();

    return(
        <div>
        <button onClick={()=> navig("/control_panel")}>Dashboard Hub</button><br/>
        <button onClick={()=> navig("/edit_sensors")}>Edit Sensors</button> <br/>
        <button onClick={()=> navig("/edit_users")}>Edit Users</button> <br/>
        </div>


    );
}