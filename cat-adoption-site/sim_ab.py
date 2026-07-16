import numpy as np, json, math

MIX = {'P1_新手': .45, 'P2_共感': .30, 'P3_隱私': .25}
P_START = np.array([.58, .52, .55])
P_COMPLETE = .82
P_SEND_A = np.array([.42, .50, .35])
EFF = {
    'C1_除罪化':    np.array([.11, 0, 0]),
    'C2_隱私說明':  np.array([0, 0, .12]),
    'C3_試相處前移': np.array([0, .10, 0]),
    'C4_退回入口':  np.array([.02, .02, .02]),
}
P_BROWSE_A, P_BROWSE_B = .05, .08
P_MEET, P_ADOPT, P_RETAIN = .70, .75, .88
N = 4000
personas = list(MIX); pw = np.array(list(MIX.values()))

def simulate(changes, browse_p, n=N, rng=None):
    per = rng.choice(3, n, p=pw)
    p_send = P_SEND_A.copy()
    for c in changes: p_send = p_send + EFF[c]
    u = rng.random((6, n))
    start = u[0] < P_START[per]
    complete = start & (u[1] < P_COMPLETE)
    send_q = complete & (u[2] < p_send[per])
    send_b = (~start) & (u[2] < browse_p)
    send = send_q | send_b
    meet = send & (u[3] < P_MEET)
    adopt = meet & (u[4] < P_ADOPT)
    retain = adopt & (u[5] < P_RETAIN)
    seg = {personas[k]: (int(send_q[(per == k)].sum()), int(complete[(per == k)].sum())) for k in range(3)}
    return dict(start=int(start.sum()), complete=int(complete.sum()), send=int(send.sum()),
                meet=int(meet.sum()), adopt=int(adopt.sum()), retain=int(retain.sum()), seg=seg)

def ztest(x1, n1, x2, n2):
    p1, p2 = x1 / n1, x2 / n2
    p = (x1 + x2) / (n1 + n2); se = math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    z = (p2 - p1) / se
    pval = 2 * (1 - 0.5 * (1 + math.erf(abs(z) / math.sqrt(2))))
    sed = math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
    return dict(p1=p1, p2=p2, diff=p2 - p1, rel=(p2 - p1) / p1, z=z, p=pval,
                ci=[(p2 - p1) - 1.96 * sed, (p2 - p1) + 1.96 * sed])

ALLC = list(EFF)

# ---- 單場「觀測實驗」(固定種子,作為報告主讀數) ----
A = simulate([], P_BROWSE_A, rng=np.random.default_rng(101))
B = simulate(ALLC, P_BROWSE_B, rng=np.random.default_rng(202))
res = {m: ztest(A[m], N, B[m], N) for m in ['start', 'complete', 'send', 'meet', 'adopt', 'retain']}
seg = {}
for k in personas:
    a_s, a_n = A['seg'][k]; b_s, b_n = B['seg'][k]
    d = ztest(a_s, a_n, b_s, b_n); d.update(a_n=a_n, b_n=b_n); seg[k] = d

# ---- 逐改動歸因:R=500 重複,取平均差與經驗 95% 區間 ----
R = 500
def replicated_lift(changes, browse_p):
    diffs = []
    for r in range(R):
        rng_a = np.random.default_rng(5000 + r); rng_s = np.random.default_rng(90000 + r)
        a = simulate([], P_BROWSE_A, rng=rng_a)['send'] / N
        s = simulate(changes, browse_p, rng=rng_s)['send'] / N
        diffs.append(s - a)
    d = np.array(diffs)
    return dict(mean=float(d.mean()), lo=float(np.percentile(d, 2.5)), hi=float(np.percentile(d, 97.5)),
                p_pos=float((d > 0).mean()))

abl = {c: replicated_lift([c], P_BROWSE_A) for c in ALLC}
abl['C5_相簿導流'] = replicated_lift([], P_BROWSE_B)
abl['B_全部合併'] = replicated_lift(ALLC, P_BROWSE_B)

# 解析期望值(交叉驗證)
completers = float((pw * P_START).sum() * P_COMPLETE)
exp = {c: float((pw * EFF[c]).sum() * completers) for c in ALLC}
exp['C5_相簿導流'] = float((1 - (pw * P_START).sum()) * (P_BROWSE_B - P_BROWSE_A))

p1 = A['send'] / N; p2t = p1 + .03
npow = math.ceil(((1.96 + .8416) ** 2 * (p1 * (1 - p1) + p2t * (1 - p2t))) / .03 ** 2)

json.dump(dict(A=A, B=B, res=res, seg=seg, abl=abl, exp=exp, n_power=npow), open('ab_results.json', 'w'),
          ensure_ascii=False, default=float)

pct = lambda x: f'{100*x:.1f}%'
print('=== 漏斗(觀測實驗 n=4000/組)===')
for m, lab in [('start', '開始配對'), ('complete', '完成測驗'), ('send', '送出意向'),
               ('meet', '見面試相處'), ('adopt', '完成認養'), ('retain', '6月未退養')]:
    print(f"{lab:8} A {A[m]:5d} ({pct(A[m]/N):>6})   B {B[m]:5d} ({pct(B[m]/N):>6})")
for m, lab in [('send', '主指標 送出意向'), ('adopt', '次指標 認養率'), ('complete', '護欄 完成測驗'), ('start', '護欄 開始配對')]:
    r = res[m]
    print(f"{lab}: A={pct(r['p1'])} B={pct(r['p2'])} {100*r['diff']:+.1f}pp z={r['z']:.2f} p={r['p']:.2e} CI[{100*r['ci'][0]:.1f},{100*r['ci'][1]:.1f}]")
print('\n=== persona 分群(送出|完成測驗)===')
for k, r in seg.items():
    print(f"{k}: A={pct(r['p1'])} B={pct(r['p2'])} {100*r['diff']:+.1f}pp p={r['p']:.4f}")
print('\n=== 逐改動歸因(R=500 重複模擬,平均差 [95% 區間];解析期望)===')
for c, r in abl.items():
    e = exp.get(c)
    print(f"{c:12} {100*r['mean']:+.2f}pp [{100*r['lo']:+.1f},{100*r['hi']:+.1f}]  期望 {'' if e is None else f'{100*e:+.2f}pp'}")
print(f"\n真實上線檢定力:MDE=3pp → 每組 n≈{npow}")
