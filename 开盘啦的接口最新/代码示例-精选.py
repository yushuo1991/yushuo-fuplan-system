import requests
headers = {'content-type': 'application/json'}
url1 = 'https://apphq.longhuvip.com/w1/api/index.php?Order=1&a=RealRankingInfo&st=60&apiv=w26&Type=1&c=ZhiShuRanking&PhoneOSNew=1&DeviceID=20ad85ca-becb-3bed-b3d4-30032a0f5923&Index=0&ZSType=7'
code_lis,name_lis,qd_lis,zljr_lis = [],[],[],[]
rr = requests.get(url1, headers=headers).json()['list']
print(len(rr))
for ii in rr:
    code = ii[0]
    name = ii[1]
    qd = ii[2]
    zljr = ii[6]
    code_lis.append(code)
    name_lis.append(name)
    qd_lis.append(qd)
    zljr_lis.append(zljr)
    print(ii)
input("按任意键继续.....")
