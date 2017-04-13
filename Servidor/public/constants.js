const CONSTANTS = {
	//Tipos de mensaje
	CONTROL_MESSAGE: 'controlMessage',
	HUMAN_MESSAGE: 'humanMessage',
	DOBLOT_MESSAGE: 'doblotMessage',

	//Estados de las entidades
	STATE_WAITING_INFO: 0,
	STATE_IDLE: 1,
	STATE_TESTING_CONNECTION: 2,
	STATE_CONNECTED: 3,

	//Tipo de contenidos de mensaje
	IMAGE: 0,
	TEXT: 1,
	VIDEOSTREAM_REQUEST: 2,

	//Subtipo para mensajes de control
	CONNECTION_RELEASE_REQUEST: 0,
	DOBLOT_SELECTED: 1,
	CONNECTION_TEST_OK: 2,
	CONNECTION_TEST_REQUEST: 3,
	HUMAN_INFO: 4,
	DOBLOT_INFO: 5,
	DOBLOT_LIST: 6,
	CONNECTION_ESTABLISHED: 7,
	CONNECTION_RELEASE: 8

}

