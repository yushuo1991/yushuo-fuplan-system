import requests


url = 'https://apphq.longhuvip.com/w1/api/index.php?a=GetYTFP_BKHX&apiv=w33&c=FuPanLa&PhoneOSNew=1&DeviceID=ffffffff-e91e-5efd-ffff-ffffa460846b&VerSion=5.11.0.6&'
r = requests.get(url).json()['List']
for ii in r:
    print(ii)
