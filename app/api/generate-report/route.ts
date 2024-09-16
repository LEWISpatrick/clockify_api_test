import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Environment variable for OpenAI API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  const { data } = await req.json();

  // Prepare the prompt for OpenAI
  const prompt = `
  You are an AI tasked with generating a weekly report based on time-tracking data from Clockify for a project. The report should follow this structure and contain the following sections:

Title and Date Range:
Include the report number and the exact date range (start and end dates of the week).
Summary:
Provide a concise overview of the work done during the week.
Include key statistics like the number of tasks worked on, accomplishments, routine tasks, blocked tasks, and tasks still in the backlog.
Weekly Achievements:
List the accomplishments during the week, along with task types (e.g., bug, chore, release) and specific details (task summary, assignee, priority, status, progress, due date).
Example:
yaml
Copy code
- Task Type: Release
- Key: 186528405
- Summary: Production Release - Jan 24th
- Assignee: William
- Priority: High
- Status: In Progress
- Due Date: 2024-01-24
Development Progress:
Detail any ongoing or upcoming releases, changes in processes, or technical adjustments made (e.g., infrastructure updates, bug fixes).
Mention any strategies or efforts made to ensure the smoothness of the release process.
Task Breakdown:
Provide a list of the tasks completed, ongoing, or to be done.
For each task, mention:
Task ID/Key
Summary of the task
Assignee
Priority
Status (e.g., To Do, In Progress, Done)
Percentage of progress or time spent.
Clocking (Time Summary):
List the time spent by each team member per day.
Example:
diff
Copy code
- William Carlos Correa: 21 hours 30 minutes
- Yan Marques: 16 hours 15 minutes
- Pedro Pioner: 4 hours 58 minutes
Sum up the total time spent across all team members.
Task Time Distribution:
Break down how much time was spent on each task and what percentage of the total time it consumed.
Example:
yaml
Copy code
Task ID: SD-71
Task Summary: Maintenance Routine
Time Spent: 9 hours 30 minutes
Percentage of Total Time: 22.24%
System Monitoring Summary (Optional if relevant data is available):
Include a table or a brief section that describes the system's operational health.
Example metrics include database health, infrastructure alerts, performance, etc.
Next Steps and Improvements:
Provide details on future improvements or action items planned for the next week (e.g., monitoring, testing automation, infrastructure updates).
Contacts:
List the contact information of key personnel.

  
  ${JSON.stringify(data)}`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const report = response.data.choices[0].message.content;
    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
