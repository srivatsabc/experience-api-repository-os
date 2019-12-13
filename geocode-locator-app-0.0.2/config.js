module.exports = {
	"client_id": "7b491b96dc21a0db2819",
	"secret": "8065edcc91851a839aa24680aa71a03beedfab9c",
	"googleapis_url": "https://www.googleapis.com/oauth2/v1/userinfo?access_token=",
	"CACHE_KEY": "__cachekey__",
	"CACHE_TIMEOUT": "60000",
	"HTTP_SUCCESS": "200",
	"HTTP_SERVICE_NOT_FOUND": "503",
	"HTTP_NOT_FOUND": "404",

	"local_endpoint": "http://localhost:8084/v2/airports/iata/IATA_CODE",
	"k8s_endpoint": "localhost",
	"user": "SYSTEM",
	"password": "hanamdc1Password",
	"replaceString": "IATA_CODE",
	"404_msg_status": 'Data Not Found',
	"404_msg": 'Requested Data Not Found',
	"503_msg_status": 'Service Unavailable',
	"503_msg": 'Endpoint Down',
	"eror_msg_template": '{"error":{"code": CODE, "endpoint": "ENDPOINT", "message": "MESSAGE", "status": "STATUS"}}',
	"404_msg_content": "X",
	"notfound_status_code": "404",

  "HTTP_CONNECTION_REFUSED_Error_Message": "connect ECONNREFUSED",
  "HTTP_CONNECTION_REFUSED_Status_Code": "503"
};
