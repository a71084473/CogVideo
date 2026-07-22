# -*- coding: utf-8 -*-
"""True-experimental 模擬(處方樣本量版):N=50、每組 25、分層區組隨機化。
作法:先跑 R=2000 次重複求【期望值與經驗檢定力】(單場二元 DV 抽樣雜訊大,必須重複),
再挑一個數值最接近平均的【代表性單場實驗】作為受試者名冊與圖表呈現。
效果量假設與 N=20 版完全相同;固定種子可重現。"""
import numpy as np, json
from scipy import stats
from math import sqrt

COMP = {'新手': 23, '共感': 15, '隱私': 12}
ALLOC_A = {'新手': 12, '共感': 7, '隱私': 6}     # A=25, B=25
BASE = {
  '新手': dict(sus=68, fric=4.3, conf=4.2, psend=.42, t_send=98),
  '共感': dict(sus=72, fric=3.6, conf=4.8, psend=.50, t_send=88),
  '隱私': dict(sus=65, fric=4.6, conf=4.3, psend=.35, t_send=95),
}
DELTA = {
  '新手': dict(sus=+12, fric=-1.5, conf=+1.0, psend=+.28, t_send=-26),
  '共感': dict(sus=+9,  fric=-0.9, conf=+1.1, psend=+.24, t_send=-14),
  '隱私': dict(sus=+14, fric=-1.7, conf=+0.9, psend=+.33, t_send=-22),
}
def clip(x, lo, hi): return float(min(max(x, lo), hi))

def one_experiment(rng):
    parts=[]; pid=1
    for pk,n in COMP.items():
        arms=np.array([0]*ALLOC_A[pk]+[1]*(n-ALLOC_A[pk])); rng.shuffle(arms)
        for a in arms:
            arm='B' if a else 'A'; b=BASE[pk]
            eff=DELTA[pk] if arm=='B' else {k:0 for k in DELTA[pk]}
            parts.append(dict(pid=f'S{pid:02d}',persona=pk,arm=arm,
                sus=round(clip(rng.normal(b['sus']+eff['sus'],8),0,100),1),
                fric=round(clip(rng.normal(b['fric']+eff['fric'],0.8),1,7),1),
                conf=round(clip(rng.normal(b['conf']+eff['conf'],0.8),1,7),1),
                sent=int(rng.random()<clip(b['psend']+eff['psend'],0,1)),
                t_send=round(clip(rng.normal(b['t_send']+eff['t_send'],18),25,240),1)))
            p=parts[-1]
            p['task_success']=sum([int(rng.random()<.98) for _ in range(3)]+[p['sent']]+[int(rng.random()<.97)])
            pid+=1
    return parts

def stats_of(parts):
    A=[p for p in parts if p['arm']=='A']; B=[p for p in parts if p['arm']=='B']
    nA,nB=len(A),len(B)
    col=lambda g,k: np.array([p[k] for p in g],float)
    out={}
    for k in ['sus','fric','conf','t_send','task_success']:
        a,b=col(A,k),col(B,k); ma,mb=a.mean(),b.mean(); sa,sb=a.std(ddof=1),b.std(ddof=1)
        t,pt=stats.ttest_ind(b,a,equal_var=False)
        u,pu=stats.mannwhitneyu(b,a,alternative='two-sided')
        sp=np.sqrt(((nB-1)*sb**2+(nA-1)*sa**2)/(nB+nA-2)); d=(mb-ma)/sp if sp>0 else 0
        g=d*(1-3/(4*(nB+nA)-9))
        se=np.sqrt(sa**2/nA+sb**2/nB)
        dfw=(sa**2/nA+sb**2/nB)**2/((sa**2/nA)**2/(nA-1)+(sb**2/nB)**2/(nB-1)) if (sa>0 or sb>0) else nA+nB-2
        tc=stats.t.ppf(.975,dfw) if dfw>0 else 2
        out[k]=dict(ma=ma,mb=mb,sa=sa,sb=sb,diff=mb-ma,t=t,pt=pt,U=u,pu=pu,g=g,ci=[(mb-ma)-tc*se,(mb-ma)+tc*se],df=dfw)
    a_sent=sum(p['sent'] for p in A); b_sent=sum(p['sent'] for p in B)
    tbl=[[b_sent,nB-b_sent],[a_sent,nA-a_sent]]
    odds,p_fish=stats.fisher_exact(tbl,alternative='two-sided')
    chi2,p_chi,_,_=stats.chi2_contingency(tbl,correction=False)
    pA,pB=a_sent/nA,b_sent/nB; rd=pB-pA
    se_rd=np.sqrt(pA*(1-pA)/nA+pB*(1-pB)/nB) if 0<pA<1 or 0<pB<1 else 0
    out['conv']=dict(a_sent=a_sent,b_sent=b_sent,pA=pA,pB=pB,rd=rd,
                     rd_ci=[rd-1.96*se_rd,rd+1.96*se_rd],odds=odds,p_fish=p_fish,p_chi=p_chi,nA=nA,nB=nB)
    return out

# ---------- (1) R 次重複:期望值與經驗檢定力 ----------
R=2000
acc={'sus':[], 'fric':[], 'conf':[], 't_send':[], 'task_success':[], 'rd':[], 'pA':[], 'pB':[]}
sig={'sus':0,'fric':0,'conf':0,'t_send':0,'task_success':0,'fish':0,'chi':0}
master=np.random.default_rng(70707)
seeds=master.integers(0,10**9,R)
for s in seeds:
    st=stats_of(one_experiment(np.random.default_rng(int(s))))
    for k in ['sus','fric','conf','t_send','task_success']:
        acc[k].append(st[k]['diff'])
        if st[k]['pt']<.05: sig[k]+=1
    acc['rd'].append(st['conv']['rd']); acc['pA'].append(st['conv']['pA']); acc['pB'].append(st['conv']['pB'])
    if st['conv']['p_fish']<.05: sig['fish']+=1
    if st['conv']['p_chi']<.05: sig['chi']+=1

mean_rd=np.mean(acc['rd']); mean_pA=np.mean(acc['pA']); mean_pB=np.mean(acc['pB'])
power={k: sig[k]/R for k in sig}
means={k: float(np.mean(acc[k])) for k in ['sus','fric','conf','t_send','task_success','rd','pA','pB']}

# ---------- (2) 挑代表性單場:綜合接近平均(RD 與四連續 DV 標準化距離最小) ----------
targets={'rd':mean_rd,'sus':means['sus'],'fric':means['fric'],'conf':means['conf'],'t_send':means['t_send']}
sds={k:np.std(acc[k]) for k in ['sus','fric','conf','t_send']}; sds['rd']=np.std(acc['rd'])
best=None
cand=master.integers(0,10**9,4000)
for s in cand:
    parts=one_experiment(np.random.default_rng(int(s))); st=stats_of(parts)
    # 純粹以「接近整體平均」挑代表場,不做顯著性篩選(誠實呈現典型單場)
    dist=abs(st['conv']['rd']-targets['rd'])/sds['rd']
    for k in ['sus','fric','conf','t_send']:
        dist+=abs(st[k]['diff']-targets[k])/sds[k]
    if best is None or dist<best[0]:
        best=(dist,int(s),parts,st)
rep_seed=best[1]; parts=best[2]; RES=best[3]

# ---------- (2b) 二元 DV 的真實所需樣本:實測 Fisher 經驗檢定力 vs n ----------
def emp_power_binary(n_per_arm, reps=1500, seed=999):
    rng=np.random.default_rng(seed)
    # 以整體 persona 比例近似分層:各層 n 依比例
    alloc={k:round(n_per_arm*COMP[k]/50) for k in COMP}
    # 修正總和
    while sum(alloc.values())<n_per_arm: alloc['新手']+=1
    while sum(alloc.values())>n_per_arm: alloc['新手']-=1
    hit=0
    for _ in range(reps):
        a=b=0
        for k,nk in alloc.items():
            pa=BASE[k]['psend']; pb=min(pa+DELTA[k]['psend'],1)
            a+=int(rng.binomial(nk,pa)); b+=int(rng.binomial(nk,pb))
        _,p=stats.fisher_exact([[b,n_per_arm-b],[a,n_per_arm-a]])
        if p<.05: hit+=1
    return hit/reps
power_curve={n: emp_power_binary(n) for n in [25,40,55,70,85,100]}
n_fisher80=next((n for n in range(25,200) if emp_power_binary(n,reps=800)>=.8), None)

out=dict(parts=parts, res={k:RES[k] for k in ['sus','fric','conf','t_send','task_success']},
         conv=RES['conv'], rand_check={'A':{k:sum(1 for p in parts if p['arm']=='A' and p['persona']==k) for k in COMP},
                                       'B':{k:sum(1 for p in parts if p['arm']=='B' and p['persona']==k) for k in COMP}},
         R=R, power=power, means=means, rep_seed=rep_seed, mean_pA=mean_pA, mean_pB=mean_pB,
         power_curve=power_curve, n_fisher80=n_fisher80)
json.dump(out, open('true_exp_n50_results.json','w'), ensure_ascii=False, default=float)

pct=lambda x:f'{100*x:.1f}%'
print(f"=== 重複模擬 R={R}(每組 25,分層區組隨機化)——期望值與經驗檢定力 ===")
print(f"送出意向 期望:A={mean_pA:.1%} B={mean_pB:.1%} RD={mean_rd:+.1%}")
print(f"經驗檢定力:Fisher={power['fish']:.0%} χ²={power['chi']:.0%} | SUS={power['sus']:.0%} 被審查感={power['fric']:.0%} 信心={power['conf']:.0%} 耗時={power['t_send']:.0%}")
print(f"平均效果 Δ:SUS={means['sus']:+.1f} 被審查感={means['fric']:+.2f} 信心={means['conf']:+.2f} 耗時={means['t_send']:+.1f}s")
print(f"\n=== 代表性單場(seed={rep_seed})——用於名冊與圖表 ===")
print("隨機化檢查:", out['rand_check'])
c=RES['conv']; print(f"送出意向 A {c['a_sent']}/25={c['pA']:.0%}  B {c['b_sent']}/25={c['pB']:.0%}  RD={c['rd']:+.0%}[{c['rd_ci'][0]:+.0%},{c['rd_ci'][1]:+.0%}] OR={c['odds']:.2f} Fisher p={c['p_fish']:.4f}")
for k,lab in [('sus','SUS'),('fric','被審查感'),('conf','信心'),('t_send','耗時s'),('task_success','任務/5')]:
    r=RES[k]; print(f"{lab:8} A={r['ma']:.2f}±{r['sa']:.2f} B={r['mb']:.2f}±{r['sb']:.2f} Δ={r['diff']:+.2f}[{r['ci'][0]:+.2f},{r['ci'][1]:+.2f}] t={r['t']:.2f} p={r['pt']:.4f} g={r['g']:+.2f}")
print(f"\n=== 二元 DV 的 Fisher 經驗檢定力 vs 每組 n ===")
for n,p in power_curve.items(): print(f"  n={n:3d}/組 → power={p:.0%}")
print(f"  Fisher 達 power .8 需每組 n≈{n_fisher80}")
