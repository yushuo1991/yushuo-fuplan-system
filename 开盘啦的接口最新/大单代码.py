import requests


url = 'https://apphq.longhuvip.com/w1/api/index.php?Order=0&st=20&a=GetMainMonitor_w30&c=StockYiDongKanPan&PhoneOSNew=1&DeviceID=00000000-296c-20ad-0000-00003eb74e84&VerSion=5.7.0.12&Token=4e7fa8458a2add3f14a50ca79e863772&Index=0&Money=2&apiv=w31&StockID=300339&UserID=1973778&IsBS=0&'
r = requests.get(url).json()['List']
for ii in r:
    print(ii)
