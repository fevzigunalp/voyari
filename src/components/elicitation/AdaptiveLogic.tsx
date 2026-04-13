import type { QuestionId } from "@/lib/types/questions";
import { QUESTION_FLOW } from "@/lib/constants/question-flow";
import { flattenForAi } from "@/lib/interests/normalize";
import type { InterestsValue } from "@/lib/interests/types";
import { determineProfileType, type AnswersMap } from "./ProfileBuilder";

/**
 * Build the ordered list of question ids based on current answers.
 * The flow is recomputed every time answers change, so newly relevant
 * branch questions are inserted seamlessly.
 */
export function buildQuestionFlow(answers: AnswersMap): QuestionId[] {
  const flow: QuestionId[] = [...QUESTION_FLOW.core];

  const transport = answers.transport as { type?: string } | undefined;
  if (transport?.type) {
    const extras = QUESTION_FLOW.conditionalByTransport[transport.type];
    if (extras) flow.push(...extras);
  }

  flow.push(...QUESTION_FLOW.secondary);

  const interestsRaw = answers.interests as
    | InterestsValue
    | string[]
    | undefined;
  const interests = flattenForAi(interestsRaw);
  // Only branch on profile when secondary answers (interests/budget/travelers) exist.
  if (interests && interests.length > 0) {
    const profile = determineProfileType(answers);
    const profileExtras = QUESTION_FLOW.conditionalByProfile[profile];
    if (profileExtras) {
      for (const id of profileExtras) {
        if (!flow.includes(id)) flow.push(id);
      }
    }
  }

  flow.push(...QUESTION_FLOW.final);
  return flow;
}
