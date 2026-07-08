#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <queue>
#include <algorithm>
#include <iomanip>
#include <sstream>

using namespace std;

struct TopicWeakness {
    int topicId;
    string topicName;
    double weaknessScore;
};

struct Problem {
    int problemId;
    string title;
    string difficulty;
    int rating;
    vector<int> topicIds;
    bool alreadySolved;
};

struct Recommendation {
    int problemId;
    string title;
    string difficulty;
    int rating;
    double score;
};

struct RecommendationComparator {
    bool operator()(
        const Recommendation& first,
        const Recommendation& second
    ) const {
        if (first.score == second.score) {
            return first.problemId >
                   second.problemId;
        }

        return first.score <
               second.score;
    }
};

class RecommendationEngine {
private:
    unordered_map<int, double>
        topicWeaknessMap;

    double calculateTopicScore(
        const Problem& problem
    ) const {
        if (problem.topicIds.empty()) {
            return 0.0;
        }

        double totalWeakness = 0.0;
        int matchedTopics = 0;

        for (int topicId : problem.topicIds) {
            auto iterator =
                topicWeaknessMap.find(topicId);

            if (
                iterator !=
                topicWeaknessMap.end()
            ) {
                totalWeakness +=
                    iterator->second;

                matchedTopics++;
            }
        }

        if (matchedTopics == 0) {
            return 0.0;
        }

        return totalWeakness /
               matchedTopics;
    }

    double calculateDifficultyScore(
        const Problem& problem
    ) const {
        if (problem.difficulty == "Medium") {
            return 100.0;
        }

        if (problem.difficulty == "Easy") {
            return 75.0;
        }

        if (problem.difficulty == "Hard") {
            return 60.0;
        }

        return 0.0;
    }

    double calculateRatingScore(
        const Problem& problem
    ) const {
        const int targetRating = 1300;

        const int ratingDifference =
            abs(
                problem.rating -
                targetRating
            );

        const double score =
            100.0 -
            (
                static_cast<double>(
                    ratingDifference
                ) /
                10.0
            );

        return max(0.0, score);
    }

    double calculateRecommendationScore(
        const Problem& problem
    ) const {
        const double topicScore =
            calculateTopicScore(problem);

        const double difficultyScore =
            calculateDifficultyScore(problem);

        const double ratingScore =
            calculateRatingScore(problem);

        const double finalScore =
            topicScore * 0.60 +
            difficultyScore * 0.25 +
            ratingScore * 0.15;

        return finalScore;
    }

public:
    RecommendationEngine(
        const vector<TopicWeakness>&
            topicWeaknesses
    ) {
        for (
            const TopicWeakness& topic :
            topicWeaknesses
        ) {
            topicWeaknessMap[
                topic.topicId
            ] = topic.weaknessScore;
        }
    }

    vector<Recommendation>
    recommendProblems(
        const vector<Problem>& problems,
        int limit
    ) const {
        priority_queue<
            Recommendation,
            vector<Recommendation>,
            RecommendationComparator
        > recommendationQueue;

        for (const Problem& problem : problems) {
            if (problem.alreadySolved) {
                continue;
            }

            const double score =
                calculateRecommendationScore(
                    problem
                );

            Recommendation recommendation = {
                problem.problemId,
                problem.title,
                problem.difficulty,
                problem.rating,
                score
            };

            recommendationQueue.push(
                recommendation
            );
        }

        vector<Recommendation>
            recommendations;

        while (
            !recommendationQueue.empty() &&
            static_cast<int>(
                recommendations.size()
            ) < limit
        ) {
            recommendations.push_back(
                recommendationQueue.top()
            );

            recommendationQueue.pop();
        }

        return recommendations;
    }
};

vector<string> split(
    const string& text,
    char delimiter
) {
    vector<string> values;

    string value;

    stringstream stream(text);

    while (
        getline(
            stream,
            value,
            delimiter
        )
    ) {
        values.push_back(value);
    }

    return values;
}

vector<int> parseTopicIds(
    const string& topicText
) {
    vector<int> topicIds;

    if (topicText.empty()) {
        return topicIds;
    }

    vector<string> values =
        split(topicText, ',');

    for (const string& value : values) {
        topicIds.push_back(
            stoi(value)
        );
    }

    return topicIds;
}

string escapeJson(
    const string& value
) {
    string escapedValue;

    for (char character : value) {
        switch (character) {
            case '"':
                escapedValue += "\\\"";
                break;

            case '\\':
                escapedValue += "\\\\";
                break;

            case '\n':
                escapedValue += "\\n";
                break;

            case '\r':
                escapedValue += "\\r";
                break;

            case '\t':
                escapedValue += "\\t";
                break;

            default:
                escapedValue += character;
        }
    }

    return escapedValue;
}

void printRecommendationsAsJson(
    const vector<Recommendation>&
        recommendations
) {
    cout << "{";
    cout << "\"success\":true,";
    cout << "\"recommendations\":[";

    for (
        size_t index = 0;
        index < recommendations.size();
        index++
    ) {
        const Recommendation&
            recommendation =
                recommendations[index];

        cout << "{";

        cout
            << "\"problemId\":"
            << recommendation.problemId
            << ",";

        cout
            << "\"title\":\""
            << escapeJson(
                recommendation.title
            )
            << "\",";

        cout
            << "\"difficulty\":\""
            << escapeJson(
                recommendation.difficulty
            )
            << "\",";

        cout
            << "\"rating\":"
            << recommendation.rating
            << ",";

        cout
            << "\"recommendationScore\":"
            << fixed
            << setprecision(2)
            << recommendation.score;

        cout << "}";

        if (
            index + 1 <
            recommendations.size()
        ) {
            cout << ",";
        }
    }

    cout << "]";
    cout << "}";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int topicCount;

    if (!(cin >> topicCount)) {
        cerr
            << "Failed to read topic count";

        return 1;
    }

    vector<TopicWeakness>
        topicWeaknesses;

    for (
        int index = 0;
        index < topicCount;
        index++
    ) {
        TopicWeakness topic;

        cin >> topic.topicId;
        cin >> topic.weaknessScore;

        cin.ignore();

        getline(
            cin,
            topic.topicName
        );

        topicWeaknesses.push_back(
            topic
        );
    }

    int problemCount;

    cin >> problemCount;

    cin.ignore();

    vector<Problem> problems;

    for (
        int index = 0;
        index < problemCount;
        index++
    ) {
        string line;

        getline(cin, line);

        vector<string> fields =
            split(line, '|');

        if (fields.size() != 6) {
            cerr
                << "Invalid problem input";

            return 1;
        }

        Problem problem;

        problem.problemId =
            stoi(fields[0]);

        problem.title =
            fields[1];

        problem.difficulty =
            fields[2];

        problem.rating =
            stoi(fields[3]);

        problem.topicIds =
            parseTopicIds(fields[4]);

        problem.alreadySolved =
            fields[5] == "1";

        problems.push_back(problem);
    }

    int recommendationLimit;

    cin >> recommendationLimit;

    RecommendationEngine engine(
        topicWeaknesses
    );

    vector<Recommendation>
        recommendations =
            engine.recommendProblems(
                problems,
                recommendationLimit
            );

    printRecommendationsAsJson(
        recommendations
    );

    return 0;
}