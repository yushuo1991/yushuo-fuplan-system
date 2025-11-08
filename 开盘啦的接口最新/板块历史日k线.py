import requests

url = 'https://apphis.longhuvip.com/w1/api/index.php?st=630&a=GetPlateKLineDay&c=ZhiShuKLine&PhoneOSNew=1&DeviceID=ffffffff-e91e-5efd-ffff-ffffa460846b&VerSion=5.14.0.0&Token=f73f4aaf4f17701d3e0a7eb3482ce62e&Index=0&apiv=w36&Type=d&StockID=801088&UserID=1973778&'

r = requests.get(url).json()
print(r)


