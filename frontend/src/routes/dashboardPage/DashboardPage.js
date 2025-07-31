import './dashboardPage.css'

const DashboardPage = () => {
    return (
    <div className='dashboardPage'>
        <div className='texts'>
            <div className='logo'>
                <img src="vlute.png" alt =""/>
                <h1>WEB AI</h1>
            </div>
            <div className='options'>
                <div className='option'>
                    <span>Create a New Chat</span>
                </div>
                 <div className='option'>
                    <span>Analyze Images</span>
                 </div>
                <div className='option'>
                    <span>Help me with My code</span>
                </div> 
            </div>
        </div>
        <div className='formContainer'>
            <form>
                <input type='text' placeholder='Aske me anything...'/>
                <button>
                    <img src="arrow.png" alt=""/>
                </button>
            </form>
        </div>
    </div>
    )
}
export default DashboardPage
