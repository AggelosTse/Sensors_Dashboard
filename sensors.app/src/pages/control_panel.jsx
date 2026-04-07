import '../styles/control_panel.css';


export function ControlPanel(){

    return(
        <div>
            <Boxes/>
        </div>
    )


    function Boxes(){
        return(
            <div className='boxes-container'>
            <div className='boxes'>Box 1 </div>
            <div className='boxes'>Box 1 </div>

            <div className='boxes'>Box 1 </div>
            </div>
        );
    }
}