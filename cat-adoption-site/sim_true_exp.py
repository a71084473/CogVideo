# -*- coding: utf-8 -*-
"""True-experimental 模擬:20 位受試者、隨機分派、組間設計。
所有效果量為訪談推導的假設(見報告 §測量與 §限制),固定種子可重現。"""
import numpy as np, json
from scipy import stats

RNG = np.random.default_rng(424242)

# ---- 20 位受試者:persona 依訪談組成(新手 45% / 共感 30% / 隱私 25%) ----
persona_plan = ['新手']*9 + ['共感']*6 + ['隱私']*5      # 9/6/5 = 20
RNG.shuffle(persona_plan)

# 每 persona 的基準參數(A 控制組),B 的處置效果(delta)——來源:易用性走查各卡點
BASE = {
  '新手': dict(sus=68, fric=4.3, conf=4.2, psend=.42, t_send=98),
  '共感': dict(sus=72, fric=3.6, conf=4.8, psend=.50, t_send=88),
  '隱私': dict(sus=65, fric=4.6, conf=4.3, psend=.35, t_send=95),
}
# B 處置效果(針對各 persona 的卡點):SUS↑、被審查感↓、信心↑、送出率↑、送出耗時↓
DELTA = {
  '新手': dict(sus=+12, fric=-1.5, conf=+1.0, psend=+.28, t_send=-26),  # C1 除罪化
  '共感': dict(sus=+9,  fric=-0.9, conf=+1.1, psend=+.24, t_send=-14),  # C3 試相處前移
  '隱私': dict(sus=+14, fric=-1.7, conf=+0.9, psend=+.33, t_send=-22),  # C2 隱私說明
}
# 未針對的 persona 也享一點 C4 退回入口/C5 的溢出(小)
SPILL = dict(sus=+3, fric=-0.3, conf=+0.4, psend=+.04, t_send=-4)

# ---- 隨機分派:完全隨機 10/10(true-experimental 的核心) ----
assign = np.array([0]*10 + [1]*10)   # 0=A, 1=B
RNG.shuffle(assign)

def clip(x, lo, hi): return float(min(max(x, lo), hi))

parts = []
for i in range(20):
    pk = persona_plan[i]; arm = 'B' if assign[i] else 'A'
    b = BASE[pk]
    if arm == 'B':
        d = DELTA[pk]
        eff = {k: d[k] + SPILL[k]*0 for k in d}   # 針對效果(主)
    else:
        eff = {k: 0 for k in DELTA[pk]}
    sus  = clip(RNG.normal(b['sus'] + eff['sus'], 8), 0, 100)
    fric = clip(RNG.normal(b['fric'] + eff['fric'], 0.8), 1, 7)   # 被審查感(越低越好)
    conf = clip(RNG.normal(b['conf'] + eff['conf'], 0.8), 1, 7)
    psend = clip(b['psend'] + eff['psend'], 0, 1)
    sent = int(RNG.random() < psend)
    t_send = clip(RNG.normal(b['t_send'] + eff['t_send'], 18), 25, 240)
    # 五任務成功:T1-3,5 幾乎必成(0.98),T4=送出意向
    tasks = [int(RNG.random() < .98) for _ in range(3)] + [sent] + [int(RNG.random() < .97)]
    parts.append(dict(pid=f'S{i+1:02d}', persona=pk, arm=arm,
                      sus=round(sus,1), fric=round(fric,1), conf=round(conf,1),
                      sent=sent, t_send=round(t_send,1), task_success=sum(tasks)))

A = [p for p in parts if p['arm']=='A']
B = [p for p in parts if p['arm']=='B']
def col(g,k): return np.array([p[k] for p in g], float)

# ---- 隨機化檢查:persona 在兩臂的分布 ----
def pcount(g):
    return {k:sum(1 for p in g if p['persona']==k) for k in ['新手','共感','隱私']}
rand_check = dict(A=pcount(A), B=pcount(B))

# ---- 推論統計(小樣本:t 檢定 + Mann-Whitney U + 效果量 + 95%CI) ----
def analyze(k, higher_better=True):
    a, b = col(A,k), col(B,k)
    ma, mb = a.mean(), b.mean(); sa, sb = a.std(ddof=1), b.std(ddof=1)
    t, pt = stats.ttest_ind(b, a, equal_var=False)          # Welch
    u, pu = stats.mannwhitneyu(b, a, alternative='two-sided')
    # Hedges g(小樣本校正)
    n1, n2 = len(b), len(a)
    sp = np.sqrt(((n1-1)*sb**2+(n2-1)*sa**2)/(n1+n2-2))
    d = (mb-ma)/sp if sp>0 else 0
    J = 1 - 3/(4*(n1+n2)-9); g = d*J
    # rank-biserial(來自 U)
    rbc = 1 - 2*u/(n1*n2)   # 方向:B>A 為正
    # 95% CI(Welch)
    se = np.sqrt(sa**2/n2 + sb**2/n1)
    dfw = (sa**2/n2+sb**2/n1)**2 / ((sa**2/n2)**2/(n2-1)+(sb**2/n1)**2/(n1-1))
    tc = stats.t.ppf(.975, dfw)
    ci = [(mb-ma)-tc*se, (mb-ma)+tc*se]
    return dict(ma=ma,mb=mb,sa=sa,sb=sb,diff=mb-ma,t=t,pt=pt,U=u,pu=pu,g=g,rbc=rbc,ci=ci,df=dfw)

res = {k: analyze(k) for k in ['sus','fric','conf','t_send','task_success']}

# ---- 主要 DV:送出意向(二元)→ Fisher 精確檢定 ----
a_sent = sum(p['sent'] for p in A); b_sent = sum(p['sent'] for p in B)
table = [[b_sent, len(B)-b_sent],[a_sent, len(A)-a_sent]]
odds, p_fish = stats.fisher_exact(table, alternative='two-sided')
# 風險差與 95%CI(Wald)
pA, pB = a_sent/len(A), b_sent/len(B)
rd = pB-pA
se_rd = np.sqrt(pA*(1-pA)/len(A)+pB*(1-pB)/len(B))
rd_ci = [rd-1.96*se_rd, rd+1.96*se_rd]

# ---- 事後檢定力(送出意向 DV,以觀測差)&所需樣本 ----
from math import sqrt
pbar = (pA+pB)/2
# 兩比例檢定力(近似)
z_a = 1.96
def power_2prop(p1,p2,n):
    from scipy.stats import norm
    if p1==p2: return .025
    sd0 = sqrt(2*pbar*(1-pbar)); sd1 = sqrt(p1*(1-p1)+p2*(1-p2))
    z = (abs(p2-p1)*sqrt(n) - z_a*sd0)/sd1
    return float(norm.cdf(z))
obs_power = power_2prop(pA,pB,10)
# 所需 n/組(power .8, 觀測效果)
n_needed = None
for n in range(5,400):
    if power_2prop(pA,pB,n) >= .8: n_needed = n; break
# SUS 的所需 n(以 g)
from scipy.stats import norm
g_sus = res['sus']['g']
n_sus = int(np.ceil(2*((1.96+0.8416)/g_sus)**2)) if g_sus>0 else None

out = dict(parts=parts, rand_check=rand_check, res=res,
           conv=dict(a_sent=a_sent,b_sent=b_sent,pA=pA,pB=pB,rd=rd,rd_ci=rd_ci,
                     odds=odds,p_fish=p_fish,obs_power=obs_power,n_needed=n_needed),
           n_sus=n_sus)
json.dump(out, open('true_exp_results.json','w'), ensure_ascii=False, default=float)

# ---- 列印 ----
print("=== 受試者(N=20)===")
print(f"{'ID':4}{'persona':8}{'臂':4}{'SUS':>6}{'審查感':>7}{'信心':>6}{'送出':>5}{'耗時s':>7}{'任務':>5}")
for p in parts:
    print(f"{p['pid']:4}{p['persona']:8}{p['arm']:4}{p['sus']:>6}{p['fric']:>7}{p['conf']:>6}{p['sent']:>5}{p['t_send']:>7}{p['task_success']:>5}")
print("\n=== 隨機化檢查(persona×臂)===", rand_check)
print("\n=== 連續 DV(B vs A;Welch t / Mann-Whitney U / Hedges g / 95%CI)===")
for k,lab in [('sus','SUS(↑)'),('fric','被審查感 1-7(↓)'),('conf','認養信心 1-7(↑)'),('t_send','送出耗時 s(↓)'),('task_success','任務成功數/5(↑)')]:
    r=res[k]
    print(f"{lab:18} A={r['ma']:.2f}±{r['sa']:.2f}  B={r['mb']:.2f}±{r['sb']:.2f}  Δ={r['diff']:+.2f} [{r['ci'][0]:+.2f},{r['ci'][1]:+.2f}]  t={r['t']:.2f} p={r['pt']:.3f}  U={r['U']:.0f} p={r['pu']:.3f}  g={r['g']:+.2f}")
print("\n=== 主要 DV:送出意向(二元)Fisher 精確檢定 ===")
print(f"A {a_sent}/10={pA:.0%}   B {b_sent}/10={pB:.0%}   風險差={rd:+.0%} [{rd_ci[0]:+.0%},{rd_ci[1]:+.0%}]  OR={odds:.2f}  p={p_fish:.3f}")
print(f"事後檢定力(N=10/組)≈{obs_power:.0%}；達 power .8 需每組 n≈{n_needed}")
print(f"SUS 若真值=觀測 g={g_sus:.2f},power .8 需每組 n≈{n_sus}")
