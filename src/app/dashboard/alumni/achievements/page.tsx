"use client";

import { Award, Trophy, Star, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils/dateFormat";

const achievements = [
    {
        id: "1",
        title: "Active Alumni Member",
        description: "Participated in 5+ alumni events",
        icon: Award,
        color: "text-blue-600",
        date: "2024-12-15",
        earned: true,
    },
    {
        id: "2",
        title: "Mentor Excellence",
        description: "Mentored 10+ students successfully",
        icon: Trophy,
        color: "text-yellow-600",
        date: null,
        earned: false,
    },
    {
        id: "3",
        title: "Career Champion",
        description: "Referred 5+ alumni job opportunities",
        icon: Star,
        color: "text-purple-600",
        date: null,
        earned: false,
    },
];

export default function AlumniAchievementsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Achievements & Badges</h1>
                <p className="mt-2 text-muted-foreground">
                    Track your contributions and earn recognition
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {achievements.filter((a) => a.earned).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Out of {achievements.length} available
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contribution Score</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">150</div>
                        <p className="text-xs text-muted-foreground">Total points earned</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">#42</div>
                        <p className="text-xs text-muted-foreground">Among all alumni</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h2 className="mb-4 text-2xl font-bold">Your Badges</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {achievements.map((achievement) => (
                        <Card
                            key={achievement.id}
                            className={achievement.earned ? "" : "opacity-50"}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="rounded-full bg-muted p-3">
                                        <achievement.icon
                                            className={`h-8 w-8 ${achievement.color}`}
                                        />
                                    </div>
                                    {achievement.earned ? (
                                        <Badge className="bg-green-600 hover:bg-green-700">
                                            Earned
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Locked</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-semibold">{achievement.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {achievement.description}
                                </p>
                                {achievement.earned && achievement.date && (
                                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            Earned on {formatDateShort(achievement.date)}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
