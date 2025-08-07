
/**
 * Normalizes an object of numbers into a probability distribution.
 * The values will sum to 1.
 */
function normalize(dist: { [key: string]: number }): { [key: string]: number } {
    const sum = Object.values(dist).reduce((s, v) => s + v, 0);
    if (sum === 0) return dist; // Avoid division by zero
    const normalized: { [key: string]: number } = {};
    for (const key in dist) {
        normalized[key] = dist[key] / sum;
    }
    return normalized;
}

/**
 * Calculates the Kullback-Leibler Divergence between two distributions.
 * Note: KLD is not symmetric, i.e., D_KL(P || Q) != D_KL(Q || P).
 * @param p The first probability distribution.
 * @param q The second probability distribution.
 * @returns The KLD value.
 */
function kullbackLeiblerDivergence(p: { [key: string]: number }, q: { [key: string]: number }): number {
    let divergence = 0;
    const epsilon = 1e-10; // A small value to prevent log(0) issues.

    const allKeys = new Set([...Object.keys(p), ...Object.keys(q)]);

    for (const key of allKeys) {
        const pVal = p[key] || epsilon;
        const qVal = q[key] || epsilon;
        divergence += pVal * Math.log(pVal / qVal);
    }
    return divergence;
}

/**
 * Calculates the symmetric Jensen-Shannon Divergence between two belief networks or distributions.
 * The result is a value between 0 (identical) and log(2) (maximally different).
 * @param distA The first distribution (e.g., agent A's beliefs).
 * @param distB The second distribution (e.g., agent B's beliefs).
 * @returns The JSD value.
 */
export function jensenShannonDivergence(
    distA: { [key: string]: number },
    distB: { [key: string]: number }
): number {
    // Ensure distributions are normalized to sum to 1
    const p = normalize(distA);
    const q = normalize(distB);

    const allKeys = new Set([...Object.keys(p), ...Object.keys(q)]);
    const m: { [key: string]: number } = {};

    // Create the average distribution m
    for (const key of allKeys) {
        m[key] = 0.5 * ((p[key] || 0) + (q[key] || 0));
    }

    const kld_pm = kullbackLeiblerDivergence(p, m);
    const kld_qm = kullbackLeiblerDivergence(q, m);

    return 0.5 * (kld_pm + kld_qm);
}
