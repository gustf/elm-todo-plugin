/*
|--------------------------------------------------------------------------
| Index.jsx
|--------------------------------------------------------------------------
|
| Welcome to your plugin.
| Documentation can be found at https://github.com/Infomaker/Dashboard-Plugin/wiki.
| Report bugs or leave feedback (about plugins or the Dashboard) at https://github.com/Infomaker/Dashboard-Plugin/issues.
|
*/

import Elm from 'react-elm-components'
import {Todo} from '../../../elm/Todo.elm'

((Dashboard, React) => {
	const sha1 = require('sha1');
	const GUI = Dashboard.GUI;
	/**
	 * Create an Application by extending the Application class
	 * Read more about Application (https://github.com/Infomaker/Dashboard-Plugin/wiki/Application)
	*/
	class Application extends Dashboard.Application {
		constructor(props) {
			super(props)

			
			this.setupPorts = ports => {
				fetch('api/me', {credentials: 'same-origin'})
					.then(res => res.json())
					.then(data => sha1(data.user.UUID + '.' +  data.user.organisationUUID))
					.then(key => {
						this.cache(key, data => {
							ports.setModel.send(data ? JSON.parse(data) : null)
						});	
						ports.setStorage.subscribe(state => {
							this.cache(key, JSON.stringify(state))
						})}
					)
			}
		}

		render() {
			return <Elm src={Todo} flags={null} ports={this.setupPorts} />
		}

	}

	/**
	 * Create a Widget by extending the Widget class
	 * Read more about Widget (https://github.com/Infomaker/Dashboard-Plugin/wiki/Widget)
	*/
	class Widget extends Dashboard.Widget {

		constructor(props) {
			super(props)
			this.state = {
				todoCount: 0
			}
		}


		render() {
			return (
				<GUI.Button text={"Todos: " + this.state.todoCount} />
			)
		}

		componentDidMount() {
			this.on("elmTodoPlugin:todoCount", userData => {
					this.setState({todoCount: userData.todoCount})
				});
		}

	}

	/**
	 * Create an Agent by extending the Agent class
	 * Read more about Agent (https://github.com/Infomaker/Dashboard-Plugin/wiki/Agent)
	*/
	class Agent extends Dashboard.Agent {
		constructor() {
			super()

			this.connect()
		}

		/**
		 * This is a example of a super simple agent. Your agent should do something more meaningful than this :)
		*/
		connect() {
			console.log("Beep beep, agent is connected...")
		}
	}

	/**
	 * Create settings for you plugin by extending the Dashboard.Settings component
	*/
	class Settings extends Dashboard.Settings {
		// Plugin settings will be displayed in the store. These settings will be available for Agent, Widget and Application.
		plugin() {
			return <Dashboard.GUI.ConfigInput ref="pluginTitle" />
		}

		// Application settings will be displayed in application settings mode. These settings will only be available for the application.
		application() {
			return <Dashboard.GUI.ConfigInput ref="pluginTitle" />
		}
	}

	/**
	 * Register your plugin in the Dashboard.
	*/
	Dashboard.register({
		// Leave this be and it will fetch the data from your manifest file in the build steps
		bundle: "@plugin_bundle",

		// Only of of these are actually required. If you are developing a widget, just remove the application and agent.
		application: Application,
		widget: Widget,
		agent: Agent,

		// Settings is optional.
		settings: Settings
	})

})(window.Dashboard, window.React)
